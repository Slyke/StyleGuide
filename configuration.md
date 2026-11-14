# Configuration and Environment Guide

Use this contract for applications that have human-authored configuration, secret values supplied by the runtime environment or files, or Docker Compose deployment.

## Configuration Contract

- Prefer JSON5 for human-authored application config when the project controls the parser.
- Keep secrets in a separate secrets JSON5 file when doing so makes file permissions, mounting, rotation, or review safer.
- Parse JSON5, resolve environment and file references recursively, apply any small set of intentional direct overrides, and then validate the final object with the project schema.
- Support an environment reference when a string value consists entirely of `${ENV_VAR}`.
- Use the conventional portable variable-name grammar `[A-Za-z_][A-Za-z0-9_]*`.
- Resolve a variable that is not present in the environment to JSON `null`.
- Preserve a variable that is present but empty as the empty string `""`.
- Preserve every other defined value exactly as a string. Do not trim it or infer numbers, booleans, JSON, or comma-separated arrays.
- Expand references recursively in array and object values, but not in object keys.
- Do not expand partial strings such as `https://${HOST}` or `prefix-${NAME}`. Whole-value replacement keeps missing values typed as `null` and avoids silently constructing malformed credentials or URLs.
- Run schema validation after expansion. A resulting `null` or empty string should fail normally when the target field does not permit it.
- Never include resolved secrets in errors, startup logs, diagnostics, exports, or health endpoints.

Example:

```json5
{
  publicBaseUrl: "${PUBLIC_BASE_URL}",
  providers: {
    example: {
      apiKey: "${EXAMPLE_API_KEY}",
      apiSecret: "${EXAMPLE_API_SECRET}",
    },
  },
}
```

With this environment:

```env
PUBLIC_BASE_URL=https://tracker.example.com
EXAMPLE_API_KEY=
# EXAMPLE_API_SECRET is not set
```

the resolved values are:

```json5
{
  publicBaseUrl: "https://tracker.example.com",
  providers: {
    example: {
      apiKey: "",
      apiSecret: null,
    },
  },
}
```

## File References

Use a whole string value of `${file:<path>}` to read a file. Use `${file:$ENV_VAR}` when an environment variable supplies the path. With `CAMERA_CERT_FILE=../secrets/camera.pem`, both references read from the `secrets` directory next to the config directory.

```json5
{
  camera: {
    password: "${file:../secrets/camera_password}",
    tlsCertificate: "${file:$CAMERA_CERT_FILE}",
  },
}
```

- Resolve paths relative to the directory of the config file being loaded. Paths must be relative and contain at most one `..` segment before normalization. This allows `../secrets/camera_password` and rejects `../../secrets/camera_password`, absolute paths, and Windows drive-qualified paths. Apply the same checks to paths supplied by environment variables.
- Supply paths containing `{` or `}` through an environment variable.
- Keep both the normalized path and the resolved symlink target inside the parent of the canonical config directory. If that parent is the filesystem root, limit reads to the config directory. A config file at the filesystem root cannot use file references.
- Read regular files as UTF-8 strings and preserve their contents, including trailing newlines. Expand each reference once and use the resulting text directly as the field value. A JSON serializer handles escaping if the value is serialized later.
- Fail config loading if a path variable is unset or empty, a path is invalid, or the file is missing, unreadable, or invalid UTF-8. Include the field and path expression in the error. Keep file contents and the value of any path variable out of diagnostics.

Keep the allowed directory tree under deployer control so other users cannot replace path components during loading. For untrusted config authors, use a dedicated, read-only secrets directory as the allowed root and restrict the process's filesystem permissions.

## Avoid Duplicate Environment Mappings

Do not maintain a one-to-one environment-variable override table for every property that already exists in JSON5. Put `${ENV_VAR}` at the property that needs runtime injection instead. This makes the config file the visible mapping and prevents the file schema, environment mapping, documentation, and tests from drifting apart.

Keep explicit direct environment variables only for:

- config and secrets file locations;
- values needed before those files can be loaded;
- deployment-mode selectors that intentionally sit outside file config;
- standardized platform controls such as `PORT` when required by the host;
- stable compatibility aliases that a project has committed to supporting.

If explicit overrides exist, apply them after reference resolution and document their higher precedence.

## Reference Implementation

Call `resolveConfigReferences({ value, configPath })` with the parsed values and path of each source config file.

```ts
import { readFileSync, realpathSync, statSync } from "node:fs";
import { dirname, resolve, sep, win32 } from "node:path";
import { TextDecoder } from "node:util";

const environmentReferencePattern = /^\$\{([A-Za-z_][A-Za-z0-9_]*)\}$/;
const fileReferencePattern = /^\$\{file:([^{}]*)\}$/;
const filePathVariablePattern = /^\$([A-Za-z_][A-Za-z0-9_]*)$/;
const utf8Decoder = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });

const resolveConfigReferences = ({
  value,
  configPath,
  env = process.env
}: {
  value: unknown;
  configPath: string;
  env?: NodeJS.ProcessEnv;
}): unknown => {
  let configDirectory: string | undefined;

  const readFileReference = ({ reference, location }: { reference: string; location: string }): string => {
    const label = `File reference ${JSON.stringify(reference)} at ${location}`;
    const variable = filePathVariablePattern.exec(reference)?.[1];
    const filePath = variable === undefined ? reference : env[variable];
    if (typeof filePath !== "string" || filePath === "") {
      throw new Error(`${label} requires a non-empty path`);
    }

    if (win32.parse(filePath).root !== "" || filePath.includes("\0")) {
      throw new Error(`${label} requires a relative path without a drive prefix or NUL`);
    }

    const segments = filePath.split(sep === "\\" ? /[\\/]/ : "/");
    if (segments.filter((segment) => segment === "..").length > 1) {
      throw new Error(`${label} allows at most one ".." segment`);
    }

    const canonicalize = ({ path }: { path: string }): string => {
      try {
        return realpathSync.native(path);
      } catch {
        throw new Error(`${label} could not be resolved`);
      }
    };

    configDirectory ??= canonicalize({ path: dirname(resolve(configPath)) });
    const parentDirectory = dirname(configDirectory);
    if (parentDirectory === configDirectory) {
      throw new Error(`${label} requires a config directory below the filesystem root`);
    }

    const allowedDirectory = dirname(parentDirectory) === parentDirectory ? configDirectory : parentDirectory;
    const allowedPrefix = `${allowedDirectory}${sep}`;
    const requestedPath = resolve(configDirectory, filePath);
    if (!requestedPath.startsWith(allowedPrefix)) {
      throw new Error(`${label} is outside the allowed directory tree`);
    }

    const realPath = canonicalize({ path: requestedPath });
    if (!realPath.startsWith(allowedPrefix)) {
      throw new Error(`${label} points outside the allowed directory tree`);
    }

    try {
      if (statSync(realPath).isFile()) return utf8Decoder.decode(readFileSync(realPath));
    } catch {
      throw new Error(`${label} could not be read as UTF-8`);
    }
    throw new Error(`${label} must refer to a regular file`);
  };

  const visit = ({ value, location }: { value: unknown; location: string }): unknown => {
    if (typeof value === "string") {
      const match = environmentReferencePattern.exec(value);
      if (match) {
        const environmentValue = env[match[1]!];
        return typeof environmentValue === "string" ? environmentValue : null;
      }

      const fileMatch = fileReferencePattern.exec(value);
      return fileMatch ? readFileReference({ reference: fileMatch[1]!, location }) : value;
    }

    if (Array.isArray(value)) {
      return value.map((entry, index) => visit({ value: entry, location: `${location}[${index}]` }));
    }

    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([key, entry]) => [
          key,
          visit({ value: entry, location: `${location}[${JSON.stringify(key)}]` })
        ])
      );
    }

    return value;
  };

  return visit({ value, location: "$" });
};
```

Test defined, explicitly empty, and unset variables separately. For file references, test literal and environment-supplied paths, preserved whitespace, missing files, invalid UTF-8, and rejection of absolute paths, two `..` segments, and symlink escapes. Also test nested objects, arrays, literal strings containing partial references, schema rejection after expansion, and precedence over or under any retained direct overrides.

## Network Transport

### MQTT

- Applications that use MQTT must support both plaintext MQTT (`mqtt://`) and MQTT over TLS (`mqtts://`) through runtime configuration.
- MQTT clients must verify the broker certificate and hostname on TLS connections. Support configuring a self-signed broker certificate or a private CA certificate as a trust anchor. [Mosquitto TLS client options](https://mosquitto.org/man/mosquitto_sub-1.html#options)
- An application that exposes an MQTT broker must accept a self-signed server certificate and matching private key for its TLS listener.

### HTTP and HTTPS

- Applications that serve HTTP must support enabling HTTPS through runtime configuration. Use the configured certificate chain and matching private key when both are supplied.
- When HTTPS is enabled and both the certificate and private key are omitted, the application must generate a self-signed certificate and private key before opening the HTTPS listener. Include the configured client-facing DNS names and IP addresses in the certificate's subject alternative names. [RFC 9525](https://www.rfc-editor.org/rfc/rfc9525.html#section-4.1)
- Fail startup if supplied TLS material is incomplete, invalid, or unreadable, or if generation fails. Protect generated private keys with restrictive permissions when storing them. Clients that verify HTTPS must explicitly trust the generated certificate.

## Docker Compose `.env`

Docker Compose projects should inject a repository-root `.env` into each application service when the file exists and continue normally when it does not. With Docker Compose 2.24 or newer, use:

```yaml
services:
  app:
    env_file:
      - path: .env
        required: false
```

Compose automatically reads a root `.env` for interpolation within the Compose YAML, but that alone does not pass every arbitrary variable into the container. `env_file` makes variables used by JSON5 `${ENV_VAR}` references available to the application process.

Apply these repository rules:

- Add `.env` to `.gitignore`.
- Add `.env` to `.dockerignore`.
- Do not `COPY` `.env` in a Dockerfile or otherwise include it in an image.
- A committed `.env.example` may contain names and safe placeholders, but never live secrets.
- Explicit `environment` entries in Compose take precedence over `env_file`; keep that list small and intentional.
- Production orchestrators may inject the same variables through their native secret/config mechanisms without creating a `.env` file.

Verify both cases: Compose config/startup succeeds without `.env`, and variables are present in the application container when `.env` exists.

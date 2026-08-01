# Configuration and Environment Guide

Use this contract for applications that have human-authored configuration, secret values supplied by the runtime environment, or Docker Compose deployment.

## Configuration Contract

- Prefer JSON5 for human-authored application config when the project controls the parser.
- Keep secrets in a separate secrets JSON5 file when doing so makes file permissions, mounting, rotation, or review safer.
- Parse JSON5, resolve environment references recursively, apply any small set of intentional direct overrides, and then validate the final object with the project schema.
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

```ts
const environmentReferencePattern = /^\$\{([A-Za-z_][A-Za-z0-9_]*)\}$/;

const resolveEnvironmentReferences = ({
  value,
  env = process.env
}: {
  value: unknown;
  env?: NodeJS.ProcessEnv;
}): unknown => {
  if (typeof value === "string") {
    const match = environmentReferencePattern.exec(value);
    if (!match) return value;

    const environmentValue = env[match[1]!];
    return environmentValue === undefined ? null : environmentValue;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => resolveEnvironmentReferences({ value: entry, env }));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        resolveEnvironmentReferences({ value: entry, env })
      ])
    );
  }

  return value;
};
```

Test defined, explicitly empty, and unset variables separately. Also test nested objects, arrays, literal strings containing partial references, schema rejection after expansion, and precedence over or under any retained direct overrides.

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

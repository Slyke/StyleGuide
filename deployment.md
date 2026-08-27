# Deployment Guide

Use this guide for services that need repeatable image publishing, traceable runtime logs, health responses, and rollback-friendly tags. The pattern is intentionally generic so it can be copied into any deployable service without depending on a specific source repository staying around.

## Deployment Contract

- Keep the application version in project metadata, such as `package.json` `version`, a language manifest, or an explicit release file.
- Generate build metadata during the image build, not at runtime.
- Include at least:
  - `version`: the release or package version.
  - `buildHash`: the Git commit hash for the built source.
- Load the generated build metadata on startup from the runtime image.
- Emit a startup log entry that includes `version` and `buildHash` before the service starts handling normal work.
- Expose `/livez` for process liveness and `/readyz` for traffic readiness. Do not add a redundant `/healthz` alias unless a platform integration explicitly requires it.
- `/livez` must be cheap and dependency-free. `/readyz` owns database, cache, upstream, and other required dependency checks.
- Both probes should return `ok`, service identity, `version`, `buildHash` or equivalent commit hash metadata, and the call's correlation ID.
- Include Kubernetes logging metadata environment variables in startup diagnostics when they are available and the logger does not already attach them.
- Configure logging sinks and gates so the startup diagnostics event is actually emitted to the intended outputs.
- Docker Compose application services should load a repository-root `.env` when it exists and should still start when it does not.
- Keep `.env` out of Git and the Docker build context; never copy it in a Dockerfile.
- Keep secrets out of startup diagnostics and health responses. Log only booleans such as `apiTokenConfigured`, not secret values.
- Tag pushed images with `latest`, the release version, and the release version plus Git hash.

## Versioning

Use one canonical application version and keep it aligned across the package metadata, release tag, image tags, and deployment manifest.

- Prefer SemVer, such as `0.4.2` in package metadata.
- Prefer Git release tags with a stable prefix, such as `v0.4.2`, when the registry or release tooling expects a visible release marker.
- Build from a clean working tree for releases. Uncommitted files make the commit hash less useful for rollback and audit.
- Create the release tag on the exact commit that is built.
- Use a short Git hash length that is long enough to be useful in registries. Twelve characters is a practical default: `git rev-parse --short=12 HEAD`.
- Do not force-move a version tag after it has been deployed. Create a new version instead.

A normal release flow is:

```bash
VERSION=v0.4.2
git status --short
git tag -a "$VERSION" -m "$VERSION"
git push origin "$VERSION"
SHA=$(git rev-parse --short=12 HEAD)
```

## Build Metadata

Generate a small build-info file as part of the container build. The final runtime image should receive that generated artifact and should not need the `.git` directory or the `git` binary.

Recommended JSON shape:

```json
{
  "version": "0.4.2",
  "buildHash": "abc1234def56"
}
```

A robust build-info generator should:

- Read `version` from the project metadata.
- Resolve the Git directory even when `.git` is a file that points at a worktree gitdir.
- Handle detached HEAD by reading the commit directly from `.git/HEAD`.
- Handle normal branches by following the ref named in `.git/HEAD`.
- Handle packed refs when the branch ref is stored in `packed-refs`.
- Fall back to `BUILD_HASH` or `unknown` only for local development and non-release builds.
- Write deterministic JSON with a trailing newline.

For Node projects, the final write should be equivalent to:

```js
const buildInfo = {
  version,
  buildHash
};

writeFileSync(outputPath, JSON.stringify(buildInfo, null, 2) + "\n", "utf8");
```

Use the same field names everywhere: startup logs, health endpoints, deployment annotations, and release notes should all say `version` and `buildHash`.

## Dockerfile Pattern

Use a small build-info stage before the runtime stage:

```Dockerfile
FROM node:22.12.0-bookworm-slim AS build-info

WORKDIR /workspace

COPY package.json ./
COPY scripts/write-build-info.mjs ./scripts/write-build-info.mjs
COPY .git ./.git

RUN node scripts/write-build-info.mjs --output /build-info.json

FROM node:22.12.0-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build-info /build-info.json ./build-info.json
COPY package.json ./
COPY src ./src

CMD ["node", "src/index.js"]
```

The final image should load `./build-info.json` at runtime. If the file is missing in local development, fall back to the package version and `BUILD_HASH` or `unknown`.

## Docker Compose Environment Files

Follow the optional Compose `.env` pattern in [`configuration.md`](./configuration.md). This belongs in `compose.yml` or `docker-compose.yml`, not in a Dockerfile. Compose must inject the variables into the application service because its automatic `.env` lookup for YAML interpolation alone does not guarantee that arbitrary variables are present inside the container.

## Runtime Build Info Loader

Load build metadata once and reuse the result for startup logs, health endpoints, and any diagnostics page. Do not shell out to `git` at runtime.

```js
const fs = require('fs');
const path = require('path');
const { version: packageVersion } = require('../package.json');

let cachedBuildInfo = null;

const parseBuildInfo = ({ value }) => {
  const version = typeof value?.version === 'string' ? value.version.trim() : '';
  const buildHash = typeof value?.buildHash === 'string' ? value.buildHash.trim() : '';
  return version && buildHash ? { version, buildHash } : null;
};

const getBuildInfo = () => {
  if (cachedBuildInfo) return cachedBuildInfo;

  const candidatePaths = [
    process.env.BUILD_INFO_PATH,
    path.join(__dirname, '..', 'build-info.json'),
    path.join(process.cwd(), 'build-info.json')
  ].filter(Boolean);

  for (const filePath of candidatePaths) {
    try {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const buildInfo = parseBuildInfo({ value: parsed });
      if (buildInfo) {
        cachedBuildInfo = buildInfo;
        return cachedBuildInfo;
      }
    } catch {
      continue;
    }
  }

  cachedBuildInfo = {
    version: packageVersion,
    buildHash: process.env.BUILD_HASH || 'unknown'
  };
  return cachedBuildInfo;
};
```

## Startup Logging

Every deployable service should log the loaded build metadata during startup. Put this log before the service reports readiness or begins normal processing.

If the shared `generateLog` implementation already attaches Kubernetes metadata, such as when `LOG_K8S_METADATA_ENABLED=true` is configured, do not duplicate that metadata in `context`. If `generateLog` does not attach Kubernetes metadata, add the available Kubernetes logging env vars yourself.

```js
const KUBERNETES_LOGGING_ENV_KEYS = [
  "K8S_POD_NAME",
  "K8S_DEPLOYMENT",
  "K8S_NAMESPACE",
  "K8S_POD_IP",
  "K8S_POD_IPS",
  "K8S_NODE_NAME"
];

const collectAvailableEnv = ({ keys, env = process.env }) => {
  return Object.fromEntries(
    keys
      .filter((key) => env[key] !== undefined && env[key] !== "")
      .map((key) => [key, env[key]])
  );
};

const logStartupDiagnostics = ({ logger, buildInfo, config }) => {
  const context = {
    version: buildInfo.version,
    buildHash: buildInfo.buildHash,
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    pid: process.pid,
    host: config.host,
    port: config.port,
    configPath: config.configPath,
    apiTokenConfigured: Boolean(config.apiToken)
  };

  const generateLogAddsKubernetes = (
    process.env.LOG_K8S_METADATA_ENABLED === 'true'
    || config.logging?.kubernetes?.enabled === true
  );
  const kubernetes = collectAvailableEnv({
    keys: KUBERNETES_LOGGING_ENV_KEYS
  });

  if (!generateLogAddsKubernetes && Object.keys(kubernetes).length > 0) {
    context.kubernetes = kubernetes;
  }

  logger.generateLog({
    level: "info",
    caller: "index::main",
    loggerKey: "SERVICE_BOOT_DIAGNOSTICS",
    message: "Service boot diagnostics.",
    context
  });
};
```

Include useful non-secret runtime and configuration diagnostics, such as config paths, port, hostname, feature flags, and whether required secrets are configured. Never log tokens, API keys, passwords, connection strings, or request bodies as part of boot diagnostics.

## Logging Sinks And Gates

The startup diagnostics log is only useful if it reaches the right sink. Configure the logger so `SERVICE_BOOT_DIAGNOSTICS` is not filtered out.

For stdout-based Kubernetes logging, prefer JSON console output and make sure `info` logs are enabled:

```env
LOG_CONSOLE_ENABLED=true
LOG_CONSOLE_FORMAT=json
LOG_CONSOLE_LEVELS=info,warn,error
LOG_K8S_METADATA_ENABLED=true
```

When using file, HTTP, or syslog forwarding, make sure the sink is enabled and its level filter includes `info`, or add an explicit gate for the startup diagnostics event:

```js
settings.logging.gates.SERVICE_BOOT_DIAGNOSTICS = {
  level: "info",
  console: true,
  file: true,
  http: true,
  syslog: true
};
```

Only enable sinks that the deployment actually uses. For example, a Kubernetes cluster that collects container stdout may only need the console sink. A platform that forwards to a SIEM may need the HTTP or syslog sink too.

Kubernetes metadata env vars should usually come from the Downward API:

```yaml
env:
  - name: LOG_K8S_METADATA_ENABLED
    value: "true"
  - name: K8S_POD_NAME
    valueFrom:
      fieldRef:
        fieldPath: metadata.name
  - name: K8S_NAMESPACE
    valueFrom:
      fieldRef:
        fieldPath: metadata.namespace
  - name: K8S_POD_IP
    valueFrom:
      fieldRef:
        fieldPath: status.podIP
  - name: K8S_NODE_NAME
    valueFrom:
      fieldRef:
        fieldPath: spec.nodeName
  - name: K8S_DEPLOYMENT
    value: your-deployment-name
```

## Probe Endpoints

Use exactly two probes unless an external platform imposes another path:

- `GET /livez` confirms only that the process and HTTP listener can answer. It must not call databases, caches, APIs, queues, DNS, certificate services, or other dependencies. A successful handler returns HTTP 200.
- `GET /readyz` determines whether the instance should receive traffic. It checks every dependency required to serve normal requests and returns HTTP 500 when any required check fails.

Do not make liveness fail for an external outage. Restarting a healthy process cannot repair PostgreSQL, Redis, or another service; readiness should remove the instance from traffic while it recovers.

The compact liveness shape is:

```json
{
  "ok": true,
  "probe": "liveness",
  "service": "example-api",
  "version": "0.4.2",
  "buildHash": "abc1234def56",
  "correlation_id": "0198f3f5-d9af-7a5b-8f1c-fcb2d40c8241"
}
```

Readiness may add a `checks` object with boolean status, a short description, and bounded latency for each dependency. Keep it operationally useful but publicly safe. Do not expose configuration revisions, record counts, key counts, key IDs, tenant names, topology, full error messages, connection strings, or other internals. Put detailed runtime state behind an authenticated administrator status endpoint.

Use the same build-info loader as startup diagnostics. Each call gets one correlation ID. A browser-facing frontend proxy should generate it and forward it to the API; a directly exposed API should accept a valid configured format and generate one when absent or malformed. Return the same ID in `x-correlation-id` and, for application-owned JSON, `correlation_id`. Do not introduce a second request-ID alias unless the system has a distinct, documented semantic need for it.

## Image Publishing

Use a version tag and a commit-specific tag for every pushed image. The version tag is convenient for humans, while the version-plus-hash tag is the precise deployment and rollback target.

```bash
USERNAME=YOURUSERNAME
DOMAIN=registry.example.com
IMAGE_NAME=your-service
# VERSION="dev"
VERSION=v0.4.2

git tag -a "$VERSION" -m "$VERSION"
git push origin "$VERSION"
# git push --force origin "$VERSION"

SHA=$(git rev-parse --short=12 HEAD)

docker build -t "$IMAGE_NAME:build" -f ./Dockerfile .

for TAG in latest "$VERSION" "$VERSION-$SHA"; do
  docker tag "$IMAGE_NAME:build" "$USERNAME/$IMAGE_NAME:$TAG"
  docker tag "$IMAGE_NAME:build" "$DOMAIN/$USERNAME/$IMAGE_NAME:$TAG"
  docker push "$USERNAME/$IMAGE_NAME:$TAG"
  docker push "$DOMAIN/$USERNAME/$IMAGE_NAME:$TAG"
done
```

Only force-move a version tag for an unreleased or intentionally replaced build. Prefer creating a new version for anything that has already been deployed.

## Kubernetes Deployment Notes

Prefer deploying the immutable `VERSION-SHA` image tag instead of `latest`. Carry the same metadata into labels or annotations when useful for operators:

```yaml
metadata:
  labels:
    app.kubernetes.io/version: v0.4.2
  annotations:
    app.example.com/buildHash: abc1234def56
spec:
  template:
    spec:
      containers:
        - name: your-service
          image: registry.example.com/team/your-service:v0.4.2-abc1234def56
```

## Verification

Before considering a deployment complete:

- Confirm the container starts successfully.
- Confirm startup logs include `version` and `buildHash`.
- Confirm Kubernetes metadata appears once in startup logs when the environment provides `K8S_*` values.
- Confirm logging sinks or gates emit `SERVICE_BOOT_DIAGNOSTICS` to the outputs required by the deployment.
- Confirm `/livez` succeeds without making dependency calls and includes service identity, `ok`, `version`, `buildHash`, and correlation metadata.
- Confirm `/readyz` checks every required dependency, returns HTTP 500 for a failed required check, and does not expose sensitive runtime details.
- Confirm liveness remains HTTP 200 during a simulated external dependency outage while readiness becomes HTTP 500.
- Confirm the pushed registry tags include `latest`, `$VERSION`, and `$VERSION-$SHA`.
- Prefer deploying the `$VERSION-$SHA` tag when exact rollback behavior matters.

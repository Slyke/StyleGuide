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
- If the project exposes `/health`, `/healthz`, or `/readyz`, each endpoint should return `ok`, `version`, and `buildHash` or equivalent commit hash metadata.
- Include Kubernetes logging metadata environment variables in startup diagnostics when they are available and the logger does not already attach them.
- Configure logging sinks and gates so the startup diagnostics event is actually emitted to the intended outputs.
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

## Health Endpoints

If a project has any health endpoint, including `/health`, `/healthz`, or `/readyz`, return a compact response that confirms the process is alive and identifies the running build:

```json
{
  "ok": true,
  "version": "0.4.2",
  "buildHash": "abc1234def56"
}
```

Use the same build-info loader as startup diagnostics. Do not add secret values, full environment dumps, or noisy internals to health responses. When readiness has a separate dependency check, keep `ok` tied to that endpoint meaning and still include `version` and `buildHash`.

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
- Confirm `/health`, `/healthz`, and `/readyz` include `ok`, `version`, and `buildHash` when the project exposes them.
- Confirm the pushed registry tags include `latest`, `$VERSION`, and `$VERSION-$SHA`.
- Prefer deploying the `$VERSION-$SHA` tag when exact rollback behavior matters.

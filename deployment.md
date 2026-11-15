# Deployment Guide

Use this guide for services that need repeatable image publishing, traceable runtime logs, health responses, and rollback-friendly tags. The pattern is intentionally generic so it can be copied into any deployable service without depending on a specific source repository staying around.

## Deployment Contract

- Keep the application version in project metadata, such as `package.json` `version`, a language manifest, or an explicit release file.
- Capture build metadata when building the image and make it available to the application at startup.
- Include at least:
  - `version`: the release or package version.
  - `buildHash`: the Git commit hash for the built source.
- Load the generated build metadata on startup from the runtime image.
- Emit a startup log entry that includes `version` and `buildHash` before the service starts handling normal work.
- Expose `/livez` for process liveness and `/readyz` for traffic readiness. Do not add a redundant `/healthz` alias unless a platform integration explicitly requires it.
- `/livez` must be cheap and dependency-free. `/readyz` owns database, cache, upstream, and other required dependency checks.
- Both probes should return `ok`, service identity, `version`, `buildHash` or equivalent commit hash metadata, and the call's correlation ID.
- Include available runtime metadata once in startup diagnostics.
- Configure logging sinks and gates so the startup diagnostics event is actually emitted to the intended outputs.
- Docker Compose application services should load a repository-root `.env` when it exists and should still start when it does not.
- Follow the [network transport contract](./configuration.md#network-transport) for configurable MQTT TLS, broker trust anchors, and HTTPS certificate provisioning.
- Keep `.env` out of Git and the Docker build context; never copy it in a Dockerfile.
- Keep secrets out of startup diagnostics and health responses. Log only booleans such as `apiTokenConfigured`, not secret values.
- Tag pushed images with the release version and the release version plus Git hash. Promote a verified stable release to `latest` explicitly.

## Versioning

Use one canonical application version and keep it aligned across the package metadata, release tag, image tags, and deployment manifest.

- Prefer SemVer, such as `0.4.2` in package metadata.
- Prefer Git release tags with a stable prefix, such as `v0.4.2`, when the registry or release tooling expects a visible release marker.
- Build from a clean working tree for releases. Uncommitted files make the commit hash less useful for rollback and audit.
- Create the release tag on the exact commit that is built.
- Use a short Git hash length that is long enough to be useful in registries. Twelve characters is a practical default: `git rev-parse --short=12 HEAD`.
- Do not force-move a version tag after it has been deployed. Create a new version instead.

Use the [image publishing skeleton](#image-publishing) to check the release version and Git commit before building or publishing.

## Build Metadata

Pass the validated release version and Git hash as build arguments. The Dockerfile patterns expose them as `APP_VERSION` and `APP_BUILD_HASH` in the final image. Projects that use a build-info file can generate it from the same inputs. The final image needs only the metadata values.

Recommended JSON shape:

```json
{
  "version": "0.4.2",
  "buildHash": "abc1234def56"
}
```

A robust build-info generator should:

- Use the validated `BUILD_VERSION` and `BUILD_HASH` when supplied.
- Read `version` from the project metadata for local builds without `BUILD_VERSION`.
- Resolve the Git directory even when `.git` is a file that points at a worktree gitdir.
- Handle detached HEAD by reading the commit directly from `.git/HEAD`.
- Handle normal branches by following the ref named in `.git/HEAD`.
- Handle packed refs when the branch ref is stored in `packed-refs`.
- Use `unknown` for a local build when source revision information is unavailable.
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

Use the example that fits the deployable artifact. Adjust dependency installation, build stages, and entry points for the project's layout. The [publishing script](#image-publishing) supplies the six build arguments. Declare them in the final stage so the application can read the corresponding `APP_*` values at runtime. Redeclare any arguments a separate build stage also needs.

### Node.js

Use the [Node.js 26.13.1 LTS image](https://hub.docker.com/_/node/tags?name=26.13.1-bookworm-slim). For SvelteKit or npm workspaces, adapt the dependency and build steps to the files and output the service needs.

```Dockerfile
FROM node:26.13.1-bookworm-slim

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY src ./src

ARG BUILD_HASH=unknown
ARG BUILD_VERSION=dev
ARG BUILD_DATE=unknown
ARG GIT_SHA=unknown
ARG GIT_DIRTY=false
ARG CI_RUN_ID=local

ENV APP_BUILD_HASH="${BUILD_HASH}" \
    APP_VERSION="${BUILD_VERSION}" \
    APP_BUILD_DATE="${BUILD_DATE}" \
    APP_GIT_SHA="${GIT_SHA}" \
    APP_GIT_DIRTY="${GIT_DIRTY}" \
    APP_CI_RUN_ID="${CI_RUN_ID}"

CMD ["node", "src/index.js"]
```

### Rust

Build the selected binary with the [Rust 1.100.0 image](https://hub.docker.com/_/rust/tags?name=1.100.0-bookworm). Keep the build and runtime stages on compatible Linux bases and install any runtime libraries the binary needs.

```Dockerfile
FROM rust:1.100.0-bookworm AS build

WORKDIR /workspace
COPY Cargo.toml Cargo.lock ./
COPY src ./src
RUN cargo build --locked --release --bin your-service

FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY --from=build /workspace/target/release/your-service /usr/local/bin/your-service

ARG BUILD_HASH=unknown
ARG BUILD_VERSION=dev
ARG BUILD_DATE=unknown
ARG GIT_SHA=unknown
ARG GIT_DIRTY=false
ARG CI_RUN_ID=local

ENV APP_BUILD_HASH="${BUILD_HASH}" \
    APP_VERSION="${BUILD_VERSION}" \
    APP_BUILD_DATE="${BUILD_DATE}" \
    APP_GIT_SHA="${GIT_SHA}" \
    APP_GIT_DIRTY="${GIT_DIRTY}" \
    APP_CI_RUN_ID="${CI_RUN_ID}"

CMD ["your-service"]
```

## Docker Compose Environment Files

Follow the optional Compose `.env` pattern in [`configuration.md`](./configuration.md). This belongs in `compose.yml` or `docker-compose.yml`, not in a Dockerfile. Compose must inject the variables into the application service because its automatic `.env` lookup for YAML interpolation alone does not guarantee that arbitrary variables are present inside the container.

## Runtime Build Info Loader

Load build metadata once and reuse it for startup logs, health endpoints, and diagnostics. For Node, the example supports an optional build-info file, then falls back to the image environment and local defaults.

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
    version: process.env.APP_VERSION?.trim() || packageVersion,
    buildHash: process.env.APP_BUILD_HASH?.trim() || process.env.BUILD_HASH || 'unknown'
  };
  return cachedBuildInfo;
};
```

In Rust, read `APP_VERSION` and `APP_BUILD_HASH` with `std::env::var`. Use `env!("CARGO_PKG_VERSION")` and `unknown` as local fallbacks when the variables are absent.

## Startup Logging

Every deployable service should log the loaded build metadata during startup. Put this log before the service reports readiness or begins normal processing.

Set `LOG_RUNTIME_ENABLED=true` or set `logging.runtime.enabled` to `true` to attach `runtime` metadata to every entry from the shared logger. Pass the same logging settings used to initialize the logger to this startup helper. When enrichment is disabled, the helper includes the available [runtime fields](./logging/logging.md#runtime-metadata) in `context.runtime` for the startup event.

```js
const { resolveRuntimeMetadata } = require('./logger');

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

  const { enabled, metadata } = resolveRuntimeMetadata({ logging: config.logging });
  if (!enabled && metadata) {
    context.runtime = metadata;
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

For deployments where a collector reads stdout, prefer JSON console output and enable `info` logs:

```env
LOG_CONSOLE_ENABLED=true
LOG_CONSOLE_FORMAT=json
LOG_CONSOLE_LEVELS=info,warn,error
LOG_RUNTIME_ENABLED=true
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

### Kubernetes example

Use the [Downward API](https://kubernetes.io/docs/concepts/workloads/pods/downward-api/) to populate the same runtime variables from the pod. Set `RUNTIME_DEPLOYMENT` from the deployment template.

```yaml
env:
  - name: LOG_RUNTIME_ENABLED
    value: "true"
  - name: RUNTIME_NAME
    valueFrom:
      fieldRef:
        fieldPath: metadata.name
  - name: RUNTIME_NAMESPACE
    valueFrom:
      fieldRef:
        fieldPath: metadata.namespace
  - name: RUNTIME_IP
    valueFrom:
      fieldRef:
        fieldPath: status.podIP
  - name: RUNTIME_IPS
    valueFrom:
      fieldRef:
        fieldPath: status.podIPs
  - name: RUNTIME_NODE
    valueFrom:
      fieldRef:
        fieldPath: spec.nodeName
  - name: RUNTIME_DEPLOYMENT
    value: "your-deployment-name"
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

When writing a publish script, inspect the project's build files and identify the components versioned together for the requested release. Fill in `check_release_versions` with those paths and adapt the build and publish steps to the artifact.

Start the resulting Bash script with a brief troubleshooting comment right after the shebang. Name the project's actual manifest paths, configuration, or commands someone needs to fix common version, build, and publish failures.

- For Svelte and Node.js, read `version` from the `package.json` files that own the release. Include workspace packages that ship together under that version.
- For Rust, use [`cargo metadata --no-deps --format-version 1`](https://doc.rust-lang.org/cargo/commands/cargo-metadata.html) and select the package being released. This resolves Cargo workspace inheritance.
- For mixed projects, check both stacks when they share a release version. For Tauri, resolve the [effective app version](https://v2.tauri.app/reference/config/#version) and use the project's bundling and publishing commands for desktop artifacts.
- For example, an `mqttctl` web image release can check the workspace, Svelte frontend, and Node API manifests. Include the Rust broker agent and MCP server when releasing their images under the same version.

Use a trusted build env file with shell assignments. Run from the repository root and pass the file path as the first argument, or use `./.build.env`. Use this file only on the publishing host. Keep it out of Git and the build context. If it sits inside the context, exclude it in the active ignore file, including a Dockerfile-specific `.dockerignore` or Podman's `.containerignore` where applicable. [Docker build context](https://docs.docker.com/build/concepts/context/#dockerignore-files) · [Podman build context](https://docs.podman.io/en/latest/markdown/podman-build.1.html#files)

```env
BUILD_USERNAME=your-team
BUILD_APP_NAME=your-service
BUILD_VERSION=v0.4.2
BUILDER_BIN=podman # or docker
# MIRROR_DOMAIN=registry.example.com
# PUSH_TAGS="beta preview"
```

Set `MIRROR_DOMAIN` to push the same tags to a mirror after Docker Hub. A failure stops the remaining tags for that destination. The script tries any remaining destination and exits nonzero if any attempt failed. The optional second argument overrides `MIRROR_DOMAIN` for one run. The script keeps the hostname in the publishing shell and uses it for temporary registry tags.

Set `BUILD_VERSION` in `.build.env` to the release version, such as `v0.4.2`. The guard rejects the literal value `latest` so moving `:latest` always requires an explicit `PUSH_TAGS=latest`. Use `PUSH_TAGS` for space-separated aliases in addition to the version and commit tags. Request `latest` after verifying a stable `MAJOR.MINOR.PATCH` release, with an optional leading `v`. Keep the comment above the guard in Bash scripts adapted from this example.

Run all version checks before tagging, building, or publishing. Fail on a missing manifest, parse error, missing version, or mismatch. The skeleton ignores an optional leading `v` during comparison and uses `BUILD_VERSION` in image tags. If the release version contains characters such as `+`, adapt the tag to the project's registry convention.

```bash
#!/usr/bin/env bash
# Adapt these recovery steps to the project's files and commands.
# For a version mismatch, align BUILD_VERSION in .build.env with the selected manifests.
# For build or push failures, check the project's Dockerfile or sign in to the destination registry.
set -euo pipefail

fail() {
  printf '%s\n' "$*" >&2
  exit 1
}

check_version() {
  local manifest=$1 actual=$2
  [[ -n ${actual#v} && ${actual#v} == "${BUILD_VERSION#v}" ]] \
    || fail "$manifest reports '${actual:-<missing>}', expected '$BUILD_VERSION'"
}

check_release_versions() {
  # Parse each selected manifest with the project's tooling and require a version string.
  # Assign the parsed version to actual, then call check_version "$manifest" "$actual".
  fail 'Fill in the version checks for this release'
}

build_env=${1:-.build.env}
[[ $build_env == /* ]] || build_env="./$build_env"
[[ -f $build_env ]] || fail "Build env file not found: $build_env"
source "$build_env"
# Keep the mirror hostname in the publishing shell.
export -n MIRROR_DOMAIN

: "${BUILD_USERNAME:?Set BUILD_USERNAME in the build env file}"
: "${BUILD_APP_NAME:?Set BUILD_APP_NAME in the build env file}"
: "${BUILD_VERSION:?Set BUILD_VERSION in the build env file}"
BUILDER_BIN=${BUILDER_BIN:-podman}
check_release_versions

GIT_SHA=$(git rev-parse --verify HEAD)
# Check the release Git tag against GIT_SHA here when the project uses one.
BUILD_HASH=$(git rev-parse --short=12 "$GIT_SHA")
BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
CI_RUN_ID=${BUILD_CI_RUN_ID:-${CI_RUN_ID:-local}}
status=$(git status --porcelain)
GIT_DIRTY=false
if [[ -n $status ]]; then
  GIT_DIRTY=true
fi

# Adapt the Dockerfile, build context, and targets to the project.
commit_tag="$BUILD_VERSION-$BUILD_HASH"
tag_pattern='^[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$'
# Reject the literal value latest so :latest requires an explicit PUSH_TAGS=latest on a stable release.
[[ $BUILD_VERSION != latest ]] || fail 'Use a release version for BUILD_VERSION'
[[ $commit_tag =~ $tag_pattern ]] || fail "Invalid commit tag: $commit_tag"
read -r -a custom_tags <<< "${PUSH_TAGS:-}"
for tag in "${custom_tags[@]}"; do
  [[ $tag =~ $tag_pattern ]] || fail "Invalid push tag: $tag"
  if [[ $tag == latest && ! $BUILD_VERSION =~ ^v?[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    fail 'Publishing latest requires a stable release version'
  fi
done
tags=("$commit_tag" "$BUILD_VERSION" "${custom_tags[@]}")

image="$BUILD_APP_NAME:$commit_tag"
"$BUILDER_BIN" build \
    --build-arg BUILD_HASH="$BUILD_HASH" \
    --build-arg BUILD_VERSION="$BUILD_VERSION" \
    --build-arg BUILD_DATE="$BUILD_DATE" \
    --build-arg GIT_SHA="$GIT_SHA" \
    --build-arg GIT_DIRTY="$GIT_DIRTY" \
    --build-arg CI_RUN_ID="$CI_RUN_ID" \
    --label "org.opencontainers.image.title=$BUILD_APP_NAME" \
    --label "org.opencontainers.image.revision=$GIT_SHA" \
    --label "org.opencontainers.image.version=$BUILD_VERSION" \
    --label "org.opencontainers.image.created=$BUILD_DATE" \
    --label "build.git.dirty=$GIT_DIRTY" \
    --label "build.ci.run-id=$CI_RUN_ID" \
    -t "$image" -f ./Dockerfile .

primary="docker.io/$BUILD_USERNAME/$BUILD_APP_NAME"
destinations=("$primary")
mirror_domain=${2:-${MIRROR_DOMAIN:-}}
if [[ -n $mirror_domain && $mirror_domain != docker.io ]]; then
  destinations+=("$mirror_domain/$BUILD_USERNAME/$BUILD_APP_NAME")
fi

publish_status=0
for destination in "${destinations[@]}"; do
  for tag in "${tags[@]}"; do
    ref="$destination:$tag"
    ref_status=0
    if "$BUILDER_BIN" tag "$image" "$ref"; then
      "$BUILDER_BIN" push "$ref" || ref_status=$?
      if [[ $destination != "$primary" ]]; then
        "$BUILDER_BIN" image rm "$ref" >/dev/null || ref_status=$?
      fi
    else
      ref_status=$?
    fi
    if (( ref_status != 0 )); then
      printf 'Publishing failed for %s (exit %d)\n' "$ref" "$ref_status" >&2
      publish_status=$ref_status
      break
    fi
  done
done
exit "$publish_status"
```

The script removes each temporary local mirror tag after its push attempt. A host that pulls directly from the mirror can show that registry address in its local image references. Inspect the image config, history, and layers to check the published content. [Docker image inspection fields](https://github.com/moby/moby/blob/master/api/types/image/image_inspect.go)

If the release uses a Git tag, verify that any existing tag points to `GIT_SHA` before building. Create and push a missing tag for that commit at the step owned by the project's release workflow. Use a new version for a build that replaces one already deployed.

## Deploying an Image

Deploy the commit-specific `BUILD_VERSION-BUILD_HASH` image tag for precise rollbacks. In Kubernetes, you can also expose that version and hash through labels and annotations.

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
          image: docker.io/your-team/your-service:v0.4.2-abc1234def56
```

## Verification

Before considering a deployment complete:

- Confirm the container starts successfully.
- Confirm startup logs include `version` and `buildHash`.
- Confirm runtime metadata appears once in startup logs when `RUNTIME_*` values are supplied.
- Confirm logging sinks or gates emit `SERVICE_BOOT_DIAGNOSTICS` to the outputs required by the deployment.
- Confirm `/livez` succeeds without making dependency calls and includes service identity, `ok`, `version`, `buildHash`, and correlation metadata.
- Confirm `/readyz` checks every required dependency, returns HTTP 500 for a failed required check, and does not expose sensitive runtime details.
- Confirm liveness remains HTTP 200 during a simulated external dependency outage while readiness becomes HTTP 500.
- Confirm the publish script stops on a version mismatch. Check that Docker Hub and any configured mirror receive the version and commit tags plus the aliases in `PUSH_TAGS`. Verify that `latest` moves only when requested for a stable release.
- Simulate a Docker Hub rejection and verify that the configured mirror receives its tags and the script exits nonzero.
- Check that the mirror hostname stays out of the running container's environment and the image config, history, and layers. Verify that the publishing host has removed its temporary mirror tags.

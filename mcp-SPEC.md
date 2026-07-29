# MCP Project Specification

This specification describes a reusable production pattern for an MCP server that fronts an upstream system. It is intentionally generic so it can be copied into other MCP projects and adapted by replacing project-specific names, upstream APIs, and domain guardrails.

## Goals

- Expose a focused set of MCP tools for one bounded operational domain.
- Keep upstream service credentials hidden from MCP clients.
- Support read-only and read-write client identities with explicit authorization checks.
- Make all write operations dry-run by default and auditable when applied.
- Provide structured logging, health checks, configuration files, environment overrides, tests, and deployable examples.

## Runtime And Transport

- Runtime SHOULD be a maintained LTS runtime for the language, such as Node.js 22 or newer for JavaScript projects.
- The server SHOULD expose Streamable HTTP MCP at `/mcp`.
- Health endpoints SHOULD be available at `/healthz` and `/readyz`.
- Health responses SHOULD include `ok`, `version`, and `buildHash` when build metadata is available.
- HTTP SHOULD be enabled for trusted LAN or sidecar deployments; HTTPS SHOULD be supported for direct remote access.
- The server SHOULD support graceful shutdown on `SIGINT` and `SIGTERM`.
- Each MCP request SHOULD create a fresh transport/session object unless the project has a clear session-state requirement.

## Bundled Application Sidecars

When an MCP server is bundled with an application whose API owns the domain logic, the MCP implementation SHOULD be a standalone subproject and separate process/container rather than an in-process API route.

- The application API and MCP sidecar MUST remain independently startable and configurable.
- MCP MUST have a master `enabled` setting. When disabled, it MUST open no MCP listeners and MUST NOT affect API or UI availability.
- The application API MAY expose independently configurable HTTP and HTTPS listeners. The MCP sidecar MUST use a configured upstream base URL so deployments can select either transport.
- The MCP sidecar SHOULD default its client-facing transport to HTTPS. A plaintext HTTP listener MAY be enabled independently for trusted local, LAN, pod, or sidecar deployments.
- Client-to-MCP and MCP-to-API authentication MUST use separate credentials. MCP clients use named, scoped Bearer tokens; the sidecar uses a dedicated upstream API key or service credential that is never returned to clients.
- A client-facing token MUST NOT be reused as the upstream API credential. Configuration validation SHOULD reject credential reuse.
- The upstream API credential MUST have only the permissions required by the registered tools. Upstream systems with higher-impact capabilities SHOULD provide a dedicated service identity or key scope.
- The API and MCP containers MAY share a mounted certificate volume. Certificate generation SHOULD be handled by an idempotent init container or one-shot Compose service before either listener starts.
- When the sidecar calls an HTTPS upstream using a private or self-signed certificate, TLS verification MUST remain enabled by default and the shared certificate or private CA SHOULD be mounted as an explicit trust anchor.
- Generated certificates MUST contain subject alternative names for every configured container/service DNS name used by verified upstream connections.
- Compose and Kubernetes examples SHOULD model the API, MCP sidecar, certificate initialization, shared certificate mount, separate secret inputs, health checks, and dependency/readiness ordering.
- Local development examples SHOULD prefer HTTP for the container-local upstream hop while retaining HTTPS for client-facing MCP. Deployment examples SHOULD show how to switch the upstream URL to verified HTTPS without code changes.

## Configuration

- Configuration MUST be loadable from both environment variables and a checked-in example config file.
- Environment variables MUST override file configuration.
- File configuration SHOULD use a human-editable format such as JSON5, TOML, or YAML.
- Required configuration MUST be validated at startup with a clear missing-key error.
- Boolean, number, list, and token-array values MUST be parsed consistently across env and file config.
- Secrets MUST never be committed. Provide `.env.example` and `config.example` files with placeholder values.
- Public config summaries returned by tools MUST omit secrets and upstream credentials.
- Network timeout, TLS verification, history/audit location, logging sinks, and default tool safety settings SHOULD be configurable.

## Authentication

- MCP clients MUST authenticate with Bearer tokens unless another project-specific mechanism is explicitly chosen.
- Tokens MUST be named so audit logs can identify the client without storing the token value.
- At minimum, support `read` and `readwrite` roles.
- Token comparisons MUST be timing-safe. Hash both supplied and configured tokens before comparison to avoid length leakage.
- Invalid or missing credentials MUST return structured `401` or `403` responses for HTTP routes.
- Health endpoints MAY be unauthenticated by default for orchestrators, but MUST support an option to require auth.
- Upstream credentials MUST only be used by the server-side upstream client, never returned to MCP callers.

## Authorization

- Read-only tools MUST be callable by both `read` and `readwrite` identities.
- Mutating tools MUST require `readwrite` or an explicit write scope.
- Every mutating tool MUST include an `apply` argument that defaults to `false`.
- Destructive tools SHOULD require an additional confirmation argument such as `confirm: true`.
- Tool registration SHOULD mark read-only and mutating tools with MCP annotations when supported.
- Tool approval guidance SHOULD be documented for clients that support per-tool approval modes.

## Tool Design

- Tools SHOULD be grouped by resource or workflow module.
- Tool names SHOULD use stable snake_case names such as `resource_list`, `resource_search`, `resource_get`, `resource_create`, `resource_update`, and `resource_delete`.
- Prefer focused tools over a single generic RPC proxy.
- Search and list tools SHOULD support filters, pagination or limits, and optional raw output.
- Get/update/delete tools SHOULD accept stable upstream identifiers where possible.
- Create/update tools SHOULD validate required fields before calling the upstream system.
- Mutating tools SHOULD return `before`, `after`, and `diff` data for planning and applied changes.
- Mutating tools SHOULD preserve unrelated upstream fields by reading the existing record, merging validated changes, then sending the full expected payload.
- Tools SHOULD expose normalized names for common fields and hide upstream naming quirks where useful.
- Tools MAY include `include_raw` for debugging, defaulting to disabled.

## Validation And Normalization

- Validate tool input with a schema library or equivalent typed parser.
- Normalize upstream responses into stable MCP-facing objects.
- Keep parsing helpers for booleans, numbers, lists, identifiers, and domain-specific address formats in shared modules.
- Do not use ad hoc string parsing when a structured parser is available.
- Unknown upstream fields SHOULD be preserved during updates unless explicitly removed by a tool.
- User-provided strings SHOULD strip control characters and trim whitespace.

## Safety Guardrails

- Encode project-specific safety rules in configuration, not only in prompts or documentation.
- Examples include allowed resource scopes, protected identifiers, excluded ranges, deny lists, write bounds, max counts, and timeout limits.
- Guardrail failures MUST prevent writes when `apply` is true.
- Guardrail warnings MAY be returned for dry-runs when the caller can still choose a safer operation.
- Reconfiguration or reload actions SHOULD be explicit, configurable, and reported in results.
- Avoid tools that can make broad destructive changes without scoped filters and confirmation.

## Upstream Client

- All upstream API calls MUST go through one client module.
- The client MUST apply base URL normalization, authentication headers, timeouts, TLS behavior, request logging, and structured error wrapping.
- GET requests MAY retry once on transient network errors.
- Non-idempotent write requests SHOULD NOT be retried unless the upstream operation is known to be idempotent.
- Paths and identifiers MUST be URL-encoded where appropriate.
- Response bodies from upstream errors SHOULD be included in internal details only after redaction.

## Logging

- Logs MUST be structured and machine-readable by default.
- The logger MUST redact configured bearer tokens, upstream API keys, upstream secrets, Authorization headers, password fields, token fields, and secret fields.
- Logs SHOULD include stable event keys such as `SERVICE_BOOT_DIAGNOSTICS`, `MCP_TOOL_CALL`, `UPSTREAM_API_REQUEST`, and `UPSTREAM_API_RESPONSE`.
- Logs SHOULD support sinks such as console, file, HTTP, or syslog when useful.
- Logging gates SHOULD allow noisy debug categories to be disabled without code changes.
- Startup diagnostics SHOULD include version, build hash, runtime version, platform, enabled listeners, configured config path, and whether required upstream credentials are configured as booleans.
- Logs MUST NOT include raw upstream response bodies by default.

## History And Auditing

- Mutating tool calls MUST be recorded in a bounded audit/history store.
- Read-only calls MAY be recorded behind a configuration flag.
- History entries SHOULD include timestamp, request id, identity name, role, tool name, action, applied flag, target summary, redacted arguments, result counts, and error code when applicable.
- History MUST NOT store secrets or full upstream response bodies.
- Provide a read-only history search tool if the audit data is useful for operators.

## Error Handling

- HTTP routes MUST return structured JSON errors with `ok: false`, a stable code, a message, and details.
- MCP tool handlers SHOULD wrap errors into stable tool errors with redacted details.
- Upstream client errors SHOULD include status code, path, and redacted upstream details.
- Validation errors SHOULD tell the caller which field failed and why.
- Unknown errors SHOULD be logged with a correlation id and returned as a generic internal error.

## Documentation

- README MUST list every tool grouped by read-only and mutating capability.
- README MUST document required upstream permissions for each tool group.
- README MUST include configuration examples for env, file config, Docker, Kubernetes, and MCP clients.
- README MUST include direct CLI examples for common MCP clients when applicable.
- README MUST explain dry-run behavior, `apply`, confirmations, and any reconfigure/reload behavior.
- Examples MUST use generic private-network values, such as `192.168.1.0/24`, unless the project needs a specific domain fixture.
- Documentation MUST distinguish required permissions from optional permissions.

## Deployment

- Provide a Dockerfile or equivalent container build path.
- Follow `deployment.md` for build metadata, startup version and commit logging, health endpoint metadata, and image tag conventions.
- Provide Kubernetes deployment examples when the project is expected to run in clusters.
- Bundled application MCP servers SHOULD ship as a dedicated sidecar image/service rather than adding MCP dependencies to the application API image.
- Health and readiness probes SHOULD be documented.
- If HTTPS is enabled, support mounted certificates and safe local development certificate generation.
- The default container should run as a non-root user when practical.
- Runtime data such as history files, generated certs, and logs SHOULD be stored in configurable paths.

## Testing

- Unit tests MUST cover auth, config parsing, validators, normalizers, guardrails, history redaction, and upstream client path construction.
- Tests MUST NOT require a live upstream service by default.
- Mock upstream clients SHOULD assert method, path, body shape, and auth behavior.
- Tests SHOULD cover read-only authorization, write authorization failures, dry-run planning, applied writes, and destructive confirmations.
- Add regression tests when normalizing upstream fields into stable MCP-facing names.
- The default check command SHOULD run syntax checks and the full test suite.

## Security Checklist

- No committed secrets in env files, config files, tests, or docs.
- Bearer tokens are named, scoped, redacted, and timing-safe compared.
- Mutating tools require write scope and dry-run by default.
- Destructive tools require confirmation.
- Upstream credentials never leave the server.
- Logs and history redact secrets and avoid raw response bodies.
- TLS verification defaults to enabled for upstream calls.
- Tool outputs avoid leaking unnecessary raw data unless `include_raw` is explicitly requested and allowed.
- Public examples use placeholder tokens and generic private-network addresses.

## New Project Checklist

- Define the upstream domain, permissions, and minimal tool set.
- Create config loading with env-over-file precedence and examples.
- Implement bearer-token auth and read/readwrite authorization.
- Build a centralized upstream client with redacted logging.
- Add validators and normalizers before registering tools.
- Make writes dry-run by default with diff output.
- Add project-specific guardrails before exposing mutating tools.
- Add structured logging and bounded history.
- Document client setup for Codex, Claude Code, and any other target MCP clients.
- Add tests that run without live upstream access.
- Run syntax checks and tests before committing.

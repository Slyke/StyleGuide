# Agent Instructions

Before making UI, CSS, JS/TS, theme, font, component-style, logging/error-handling, deployment, health endpoint, or MCP server changes in projects that reference this repository:

1. Read [`design.md`](./design.md) when the work touches UI, CSS, theme, typography, layout, or component visuals.
2. Read [`style.md`](./style.md) for the stricter local UI contract.
3. Read [`JAVASCRIPT_AND_TS_CODING_STYLE.md`](./JAVASCRIPT_AND_TS_CODING_STYLE.md).
4. Read [`SVELTE_NODE_HTTP_PROXY.md`](./SVELTE_NODE_HTTP_PROXY.md) when the work touches SvelteKit/Node HTTP API proxying or configurable API base paths.
5. Read [`logging/logging.md`](./logging/logging.md) when the work touches logging or structured errors.
6. Read [`deployment.md`](./deployment.md) when the work touches Docker builds, releases, startup diagnostics, health endpoints, image tags, or deployable service metadata.
7. Treat `design.md` as the portable design-token source for LLM and tool consumers.
8. Treat `style.md` as the canonical local UI style contract.
9. Read [`mcp-SPEC.md`](./mcp-SPEC.md) when the work touches MCP servers or MCP tools.
10. Treat `JAVASCRIPT_AND_TS_CODING_STYLE.md` as the canonical implementation style contract.
11. Treat `SVELTE_NODE_HTTP_PROXY.md` as the canonical SvelteKit Node API proxy contract.
12. Treat `logging/logging.md` as the canonical logging and error-handling guide for copied logger setups.
13. Treat `deployment.md` as the canonical deployment metadata, startup diagnostics, health endpoint, and image publishing contract.
14. Treat `mcp-SPEC.md` as the canonical MCP server project specification.
15. Only read `index.html`, `styles.css`, or `script.js` if the contract is insufficient or a concrete example is required.
16. Reuse the existing semantic tokens and interaction rules before inventing new patterns.

## Configuration Work

Read [`configuration.md`](./configuration.md) when work touches JSON5 config, secrets, environment variables, `.env`, or Docker Compose. Treat it as the canonical environment-reference and Compose `.env` contract.

Prefer config-file `${ENV_VAR}` references over duplicating every config property as a direct environment override. Docker Compose projects should inject an optional root `.env` into application services and continue normally when the file is absent.

## WSL2 Command Environment

If this repository is run in WSL2 or another Linux environment:

- Non-interactive shells may not load `~/.bashrc` and may therefore skip `nvm` initialization.
- Before `node` or `npm` commands, initialize `nvm` explicitly:
  `export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"`

## Required Agent Behavior

- Do not hardcode random colors when an existing semantic tone fits.
- Do not introduce gradients unless the project explicitly overrides this style system.
- Keep theme switching token-driven through root state such as `data-theme`.
- Keep font switching root-driven through `data-font`.
- Prefer `design.md` and `style.md` over scanning the full demo implementation.
- Use repo-relative paths that start with `./` unless explicitly told to use an absolute path.
- Preserve the semantic meanings of:
  - `start`
  - `mid`
  - `warning`
  - `danger`
- Prefer updating shared variables and shared component rules over adding one-off exceptions.
- Follow the coding conventions defined in `JAVASCRIPT_AND_TS_CODING_STYLE.md` when editing JS, TS, or similar implementation files.
- Deployable software should log its version and Git commit hash on startup, using the `deployment.md` build metadata pattern.
- Prefer exactly `/livez` and `/readyz`: liveness is dependency-free process/listener status, while readiness checks every dependency required for traffic. Do not add a redundant `/healthz` alias without a platform requirement.
- Public probes should include service identity, `ok`, version/build metadata, and correlation metadata without exposing configuration revisions, counts, key IDs, tenant data, or topology.

## If Extending The System

- Update `design.md` and `style.md` when adding new reusable UI patterns or design tokens.
- Update `JAVASCRIPT_AND_TS_CODING_STYLE.md` only when the coding conventions themselves change.
- Keep documentation and implementation aligned.
- If a project intentionally diverges, document the divergence explicitly instead of silently drifting from the guide.

## Language support
Unless otherwise specified:
- Create an `en-US.json` file for user-facing strings.
- Keep it flat, using keys in the format below.
- Copy only the `interpolate` function from `./interpolation.js` when you need to place dynamic values into rendered text.

Example language file:
```
{
  "project_name-page_title": "My Project",
  "project_name-page_description": "Example of some text",
  "project_name-some_interpolation-label": "Example of some {$interpolation}"
}
```

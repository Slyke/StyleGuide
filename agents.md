# Agent Instructions

Before making UI, CSS, JS/TS, theme, font, component-style, or logging/error-handling changes in projects that reference this repository:

1. Read [`style.md`](./style.md).
2. Read [`CODING_STYLE.md`](./CODING_STYLE.md).
3. Read [`logging/logging.md`](./logging/logging.md) when the work touches logging or structured errors.
4. Treat `style.md` as the canonical UI style contract.
5. Treat `CODING_STYLE.md` as the canonical implementation style contract.
6. Treat `logging/logging.md` as the canonical logging and error-handling guide for copied logger setups.
7. Only read `index.html`, `styles.css`, or `script.js` if the contract is insufficient or a concrete example is required.
8. Reuse the existing semantic tokens and interaction rules before inventing new patterns.

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
- Prefer contract docs over scanning the full demo implementation.
- Use repo-relative paths that start with `./` unless explicitly told to use an absolute path.
- Preserve the semantic meanings of:
  - `start`
  - `mid`
  - `warning`
  - `danger`
- Prefer updating shared variables and shared component rules over adding one-off exceptions.
- Follow the coding conventions defined in `CODING_STYLE.md` when editing JS, TS, or similar implementation files.

## If Extending The System

- Update `style.md` when adding new reusable patterns.
- Update `CODING_STYLE.md` only when the coding conventions themselves change.
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

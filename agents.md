# Agent Instructions

Before making UI, CSS, theme, font, or component-style changes in projects that reference this repository:

1. Read [`style.md`](./style.md).
2. Read [`CODING_STYLE.md`](./CODING_STYLE.md).
3. Treat `style.md` as the canonical UI style contract.
4. Treat `CODING_STYLE.md` as the canonical implementation style contract.
5. Reuse the existing semantic tokens and interaction rules before inventing new styling patterns.

## Required Agent Behavior

- Do not hardcode random colors when an existing semantic tone fits.
- Do not introduce gradients unless the project explicitly overrides this style system.
- Keep theme switching token-driven through root state such as `data-theme`.
- Keep font switching root-driven through `data-font`.
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

# styleguid

## What This Repo Contains

- `index.html`: demo page with the controls and examples
- `design.md`: Google DESIGN.md-style machine-readable tokens and design rationale for LLM consumers
- `styles.css`: token-driven light and dark theme implementation
- `script.js`: theme, font, and demo interaction behavior
- `interpolation.js`: self-testing string interpolation reference; copy only `interpolate` into consuming projects
- `style.md`: canonical UI contract for humans and LLMs
- `JAVASCRIPT_AND_TS_CODING_STYLE.md`: implementation style rules for JS and TS
- `SVELTE_NODE_HTTP_PROXY.md`: SvelteKit Node HTTP API proxy pattern for configurable browser-to-API routing
- `agents.md`: instructions for agents consuming this repo

## Primary Entry Points

If you are using this repository from another project:

- Read `design.md` first when an LLM or tool needs portable design tokens.
- Read `style.md` second for the stricter local UI contract.
- Read `JAVASCRIPT_AND_TS_CODING_STYLE.md` third for implementation conventions.
- Read `agents.md` if the consumer is an agent or LLM workflow.
- Read `SVELTE_NODE_HTTP_PROXY.md` when work touches SvelteKit/Node HTTP API proxying or configurable API base paths.
- Read `index.html`, `styles.css`, and `script.js` only when you need implementation examples.

## System Summary

This style system is built around:

- full-page monospace typography
- root-driven `data-theme` switching
- root-driven `data-font` switching
- flat surfaces with no gradients
- four semantic tones:
  - `start`
  - `mid`
  - `warning`
  - `danger`

The current demo supports:

- dark mode
- light mode
- page-wide font selection
- page-wide content width selection
- shared control styling for buttons, inputs, selects, textareas, sliders, toggles, tabs, alerts, badges, tables, cards, details/summary disclosures, dropdown multi-selects, removable badge actions, modal dialogs, and table-cell inspection buttons

## Usage

Open `index.html` in a browser to inspect the demo.

Carry the system into another project by preserving the root contract:

```html
<html data-theme="dark" data-font="system-stack" data-content-width="standard">
```

Then keep component styling token-driven and aligned with `style.md`.

## Agent Use

This repository is intentionally documented for LLM-first consumption.

- `design.md` is the portable design-token source for LLMs and compatible tooling.
- `style.md` is the shortest local source of truth for UI decisions.
- `JAVASCRIPT_AND_TS_CODING_STYLE.md` is the source of truth for implementation conventions.
- `SVELTE_NODE_HTTP_PROXY.md` is the source of truth for the SvelteKit Node API proxy pattern.
- `agents.md` tells agents to prefer those docs over scanning the whole demo.

## Notes

- Theme switching should happen at the root, not per component.
- Font switching should change the whole page, not isolated elements.
- Blue, green, warning, and danger tones should remain semantically stable.
- If reusable design tokens or component rules change, update `design.md` and `style.md` so downstream projects stay aligned.

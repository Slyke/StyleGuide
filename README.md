# styleguid

Monospace UI style guide and reference implementation for plain HTML/CSS with a path to Svelte integration.

## What This Repo Contains

- `index.html`: demo page with the controls and examples
- `styles.css`: token-driven light and dark theme implementation
- `script.js`: theme, font, and demo interaction behavior
- `interpolation.js`: string interpolation helper for locale text
- `style.md`: canonical UI contract for humans and LLMs
- `CODING_STYLE.md`: implementation style rules
- `agents.md`: instructions for agents consuming this repo

## Primary Entry Points

If you are using this repository from another project:

- Read `style.md` first.
- Read `CODING_STYLE.md` second.
- Read `agents.md` if the consumer is an agent or LLM workflow.
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
- shared control styling for buttons, inputs, selects, textareas, sliders, toggles, tabs, alerts, badges, tables, and cards

## Usage

Open `index.html` in a browser to inspect the demo.

Carry the system into another project by preserving the root contract:

```html
<html data-theme="dark" data-font="system-stack">
```

Then keep component styling token-driven and aligned with `style.md`.

## Agent Use

This repository is intentionally documented for LLM-first consumption.

- `style.md` is the shortest source of truth for UI decisions.
- `CODING_STYLE.md` is the source of truth for implementation conventions.
- `agents.md` tells agents to prefer those docs over scanning the whole demo.

## Notes

- Theme switching should happen at the root, not per component.
- Font switching should change the whole page, not isolated elements.
- Blue, green, warning, and danger tones should remain semantically stable.
- If the reusable system changes, update `style.md` so downstream projects stay aligned.

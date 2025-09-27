# Style Contract

This file is the canonical UI contract for this style system.

If an agent or project references this repository:

- Read this file first.
- Read `CODING_STYLE.md` second for implementation conventions.
- Read `index.html`, `styles.css`, and `script.js` only if this contract is not enough or a concrete example is needed.

## Purpose

This system defines a monospace UI with:

- dark and light themes
- root-driven theme switching
- root-driven font switching
- four semantic color tones
- secondary function accents kept separate from semantic status tones
- flat surfaces with no gradients
- shared rules that work in plain HTML/CSS and can be carried into Svelte

## Required

- Use a monospace font for the entire UI, not just code blocks.
- Drive theme from a root `data-theme` attribute.
- Drive font from a root `data-font` attribute.
- Style controls from shared tokens and shared rules.
- Preserve the semantic tones `start`, `mid`, `warning`, and `danger`.
- Keep hover, focus, selected, and error behavior semantically consistent.
- Prefer shared variables and shared component rules over one-off exceptions.

## Forbidden

- Do not introduce gradients unless a project explicitly chooses to diverge.
- Do not hardcode random accent colors when an existing semantic tone fits.
- Do not switch themes with per-component theme classes if root state can handle it.
- Do not switch fonts with per-component overrides if root state can handle it.
- Do not rename or repurpose the four semantic tones without updating this file.

## Root Contract

Apply state at the root element, ideally `html`:

```html
<html data-theme="dark" data-font="system-stack">
```

Supported `data-theme` values:

- `dark`
- `light`

Supported `data-font` values:

- `system-stack`
- `ui-mono`
- `generic-mono`
- `sf-mono`
- `menlo`
- `monaco`
- `cascadia-mono`
- `consolas`
- `lucida-console`
- `courier-new`
- `roboto-mono`
- `droid-sans-mono`
- `noto-sans-mono`
- `ubuntu-mono`
- `dejavu-sans-mono`
- `liberation-mono`

## Semantic Tones

- `start`: primary actions, active states, hover energy, initial states, neon blue
- `mid`: informational states, selected states, in-progress states, neon green
- `warning`: caution, review, focus emphasis, 75% states, amber
- `danger`: destructive actions, terminal states, error states, strong red

Use these tone meanings consistently across alerts, buttons, toggles, inputs, tabs, sliders, badges, and status panels.

## Interaction Mapping

- Hover should bias toward `start`.
- Keyboard focus should bias toward `warning`.
- Selected, checked, and switched-on states should bias toward `mid`.
- Error and destructive emphasis should bias toward `danger`.
- Disabled interactive controls should use dashed borders or tracks, reduced saturation, and no lift.
- Motion should stay fast and restrained.
- Current baseline transition timing is `120ms ease-out`.

## Theme Intent

Dark theme:

- near-black background
- flat surfaces
- neon accents
- strong borders and fills

Light theme:

- pale neutral background
- flat surfaces
- same semantic hues with lower glare
- crisp borders and readable ink colors

## Font Contract

Use a single page-wide variable for UI typography:

```css
--font-mono
```

Changing the selected font must change the entire page, including controls, labels, tables, badges, code blocks, and helper text.

Recommended default stack:

```css
ui-monospace, "SF Mono", "SFMono-Regular", Menlo, Monaco,
"Cascadia Mono", "Cascadia Code", Consolas, "Lucida Console",
"Roboto Mono", "Droid Sans Mono", "Noto Sans Mono", "Ubuntu Mono",
"DejaVu Sans Mono", "Liberation Mono", "Courier New", monospace
```

## Component Contract

- Buttons, inputs, selects, textareas, tabs, switches, sliders, badges, alerts, tables, cards, and code blocks should inherit from shared theme tokens.
- Custom controls should use semantic tone tokens instead of inventing local accent palettes.
- Neutral controls may use passive steel or gray tokens for baseline, utility, or non-semantic states.
- Secondary accents such as `accent-alpha`, `accent-beta`, and `accent-gamma` may be used for function grouping or categorization, but not for status semantics.
- Secondary accents must stay visibly separate from `start`, `mid`, `warning`, and `danger`.
- Secondary accents should also stay distinct from each other instead of collapsing into near-neighbor hues.
- Tables may use row-level hover and checkbox-selected highlighting, but the row color should still map back to neutral or one of the semantic tones.
- When secondary accents are part of a guide, show them across multiple surfaces such as alerts, stat blocks, table rows, swatches, and color-pair tests.
- Disabled controls should read as intentionally unavailable with dashed borders or tracks, low saturation, and no hover or active elevation.
- Disabled controls should preserve their underlying tone family while muted so unavailable states still read correctly.
- Tone meaning must stay legible for users who may confuse green and yellow unless contrast and hue separation are deliberate.
- Blue and green must stay visibly distinct.
- Green and warning must stay visibly distinct.
- Danger should read as red first, not pink first.

## Svelte Contract

In Svelte or any component framework:

- keep theme in app state or a store
- keep font in app state or a store
- write those values to `document.documentElement.dataset`
- keep component CSS bound to shared variables rather than duplicating theme-specific class trees

Minimal example:

```js
document.documentElement.dataset.theme = theme;
document.documentElement.dataset.font = font;
```

## Decision Rule

If a project is extending this system:

- reuse an existing tone before creating a new one
- reuse an existing component rule before creating a local exception
- update this file when a reusable pattern changes
- document intentional divergence explicitly

## Canonical Source

This file is the shortest source of truth for the UI system.
The demo files show implementation examples, but this contract should be enough for most agent decisions.

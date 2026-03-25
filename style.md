# Style Guide Reference

This repository is the reference implementation for a monospace UI system with:

- dark and light themes
- a root-level font selector
- shared semantic tone tokens
- token-driven component styling suitable for plain HTML/CSS and Svelte

Use this document as the contract when applying the style system to other projects.

## Core Rules

- Use monospace fonts for the full UI, not only code blocks.
- Drive theme and font from root data attributes, not per-component overrides.
- Keep component styles token-based. Do not hardcode one-off colors unless they become new tokens.
- Avoid gradients. Surfaces should be flat and rely on tone, border, and contrast.
- Preserve the four semantic tones:
  - `start`: primary, active, hover, “good”
  - `mid`: informational, in-progress, selected
  - `warning`: caution, review, 75%
  - `danger`: end state, destructive, error

## Root State

Apply state at the app root, ideally `html`:

```html
<html data-theme="dark" data-font="system-stack">
```

Supported theme values:

- `dark`
- `light`

Supported font values:

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

## Theme Behavior

The page should switch theme by changing `data-theme` only. Component rules should stay shared.

Dark mode intent:

- near-black background
- neon accents
- stronger fills and borders

Light mode intent:

- pale neutral background
- same semantic hues, reduced glare
- crisp borders and readable ink colors

## Interaction Rules

- Hover should bias toward `start` blue.
- Keyboard focus should use `warning` amber.
- Selected and “on” states should bias toward `mid` green.
- Error emphasis should use `danger` red.
- Motion should stay fast and restrained. Current baseline is `120ms ease-out`.

## Component Rules

- Buttons, inputs, selects, textareas, badges, tabs, alerts, switches, sliders, and tables should all inherit from shared theme tokens.
- Custom controls should use the semantic tone tokens instead of inventing local accent colors.
- Code blocks and inline code should still use the global monospace family.
- Alerts and contrast panels should show tone meaning clearly enough to distinguish blue vs green and green vs warning for color-sensitive users.

## Typography

Use `--font-mono` as the single page-wide font variable. Changing the selected font should change the entire UI.

Recommended default stack:

```css
ui-monospace, "SF Mono", "SFMono-Regular", Menlo, Monaco,
"Cascadia Mono", "Cascadia Code", Consolas, "Lucida Console",
"Roboto Mono", "Droid Sans Mono", "Noto Sans Mono", "Ubuntu Mono",
"DejaVu Sans Mono", "Liberation Mono", "Courier New", monospace
```

## Svelte Integration

For Svelte apps:

- keep theme and font in a store or root state
- update `document.documentElement.dataset.theme`
- update `document.documentElement.dataset.font`
- keep component CSS bound to shared variables instead of duplicating per-theme class trees

Example:

```js
document.documentElement.dataset.theme = theme;
document.documentElement.dataset.font = font;
```

## Adoption Checklist

- Copy or map the root tokens first.
- Preserve `data-theme` and `data-font`.
- Reuse semantic tone names: `start`, `mid`, `warning`, `danger`.
- Keep hover/focus/selected behavior consistent with this guide.
- If adding a new control, style it through existing tokens before inventing new ones.
- If adding a new visual pattern, update this document so it remains the canonical reference.

## Canonical Source

When another project references this style system, this file is the human-readable source of truth. The demo implementation in this repository exists to show the rules in practice.

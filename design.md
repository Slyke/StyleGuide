---
version: alpha
name: Styleguid
description: Machine-readable design system for the Styleguid monospace light/dark UI baseline, following the Google DESIGN.md pattern of YAML tokens plus ordered Markdown guidance.
colors:
  primary: "#00b6ff"
  secondary: "#39ff79"
  tertiary: "#ffbc3a"
  neutral: "#eef3f9"
  dark-bg: "#040506"
  dark-panel: "#0c1014"
  dark-panel-strong: "#10161c"
  dark-border: "#202835"
  dark-text: "#eef6ff"
  dark-muted: "#a4b0c2"
  light-bg: "#eef3f9"
  light-panel: "#f8fbff"
  light-panel-strong: "#edf3fa"
  light-border: "#c8d4e3"
  light-text: "#132237"
  light-muted: "#465a73"
  start: "#00b6ff"
  start-light: "#007edb"
  start-fill-strong: "rgba(0, 182, 255, 0.28)"
  start-ink: "#d8f9ff"
  mid: "#39ff79"
  mid-light: "#12b84b"
  mid-fill-strong: "rgba(57, 255, 121, 0.22)"
  mid-ink: "#e0ffe8"
  warning: "#ffbc3a"
  warning-light: "#cc7a00"
  warning-fill-strong: "rgba(255, 188, 58, 0.24)"
  warning-ink: "#fff0d2"
  danger: "#ff1f5a"
  danger-light: "#cc1f4d"
  danger-fill-strong: "rgba(255, 31, 90, 0.3)"
  danger-ink: "#ffe0e8"
  accent-alpha: "#b86cff"
  accent-beta: "#ff6fce"
  accent-gamma: "#c37c50"
  accent-neutral: "#d0d7e2"
typography:
  body:
    fontFamily: "ui-monospace, SF Mono, SFMono-Regular, Menlo, Monaco, Cascadia Mono, Cascadia Code, Consolas, Lucida Console, Roboto Mono, Droid Sans Mono, Noto Sans Mono, Ubuntu Mono, DejaVu Sans Mono, Liberation Mono, Courier New, monospace"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  heading:
    fontFamily: "ui-monospace, SF Mono, SFMono-Regular, Menlo, Monaco, Cascadia Mono, Cascadia Code, Consolas, Lucida Console, Roboto Mono, Droid Sans Mono, Noto Sans Mono, Ubuntu Mono, DejaVu Sans Mono, Liberation Mono, Courier New, monospace"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0em"
  label:
    fontFamily: "ui-monospace, SF Mono, SFMono-Regular, Menlo, Monaco, Cascadia Mono, Cascadia Code, Consolas, Lucida Console, Roboto Mono, Droid Sans Mono, Noto Sans Mono, Ubuntu Mono, DejaVu Sans Mono, Liberation Mono, Courier New, monospace"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.12em"
  control:
    fontFamily: "ui-monospace, SF Mono, SFMono-Regular, Menlo, Monaco, Cascadia Mono, Cascadia Code, Consolas, Lucida Console, Roboto Mono, Droid Sans Mono, Noto Sans Mono, Ubuntu Mono, DejaVu Sans Mono, Liberation Mono, Courier New, monospace"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.02em"
rounded:
  sm: "0.45rem"
  md: "0.8rem"
  lg: "1.25rem"
  full: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  xxl: "3rem"
  container: "76rem"
components:
  button-primary:
    backgroundColor: "{colors.start-fill-strong}"
    textColor: "{colors.start-ink}"
    typography: "{typography.control}"
    rounded: "{rounded.md}"
    padding: "0.78rem 1rem"
    height: "2.75rem"
  button-secondary:
    backgroundColor: "{colors.mid-fill-strong}"
    textColor: "{colors.mid-ink}"
    typography: "{typography.control}"
    rounded: "{rounded.md}"
    padding: "0.78rem 1rem"
    height: "2.75rem"
  panel:
    backgroundColor: "{colors.dark-panel}"
    textColor: "{colors.dark-text}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xl}"
  card:
    backgroundColor: "{colors.dark-panel-strong}"
    textColor: "{colors.dark-text}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  field:
    backgroundColor: "{colors.dark-panel-strong}"
    textColor: "{colors.dark-text}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0.8rem 0.9rem"
    height: "2.9rem"
---

# Styleguid Design System

## Overview

Styleguid is a compact technical UI baseline for token-driven tools. It should feel precise, inspectable, and work-focused: monochrome structure, semantic neon states, and controls that clearly separate pressable actions from passive labels.

This file follows the Google DESIGN.md structure: YAML front matter provides portable tokens for LLM and tool consumers, while the Markdown sections explain how to apply them. Read style.md for the stricter local contract. Use index.html only as the runnable demo and visual reference.

The first screen of a consuming app should be the real tool or workflow, not a marketing landing page. Keep index.html in this repo as the implementation demo.

## Colors

The system has two complete themes and four semantic tones. Theme switching must be driven from the root data-theme attribute, not per-component theme classes.

Dark theme is the default: near-black surfaces, high-contrast text, strong borders, and vivid accents. Light theme uses pale neutral surfaces and the same tone meanings with lower glare.

Semantic tones are stable:

- Start is blue for primary actions, hover energy, initial states, and active affordance.
- Mid is green for selected, informational, enabled, and in-progress states.
- Warning is amber for keyboard focus, caution, review, and 75 percent states.
- Danger is red for destructive, terminal, and error states.

Secondary accents, such as alpha, beta, gamma, and neutral, are for grouping functions and categorization. They must not replace status tones. Do not introduce gradients by default.

## Typography

Everything is monospace: headings, body text, controls, labels, tables, badges, code, helper text, and form values. The page-wide font must come from the root data-font attribute and resolve through the shared font variable.

Use hierarchy through size, weight, casing, and spacing rather than font-family changes. Labels and metadata are uppercase with positive letter spacing. Do not add negative letter spacing in new compact controls or dense surfaces.

## Layout

Use a constrained shell with a maximum width of 76rem and responsive padding. Page sections are full-width bands or unframed layouts inside that shell. Avoid cards inside cards.

Controls should sit in compact rows or predictable grids. Repeated item groups may use cards. Tool surfaces should prioritize scanning, comparison, and repeated action over decorative hero composition.

Fixed-format UI elements, such as toolbars, boards, counters, tabs, and button groups, need stable dimensions or wrapping rules so labels and state changes do not resize the layout unexpectedly.

## Elevation & Depth

The system is mostly flat. Depth comes from tonal layers, crisp borders, and restrained shadows.

Pressable controls are the main exception. Buttons and action chips should read as raised keycaps at rest, with a visible top glint, heavier bottom edge, and downward active movement. Passive labels, badges, and status tags should remain flatter so they are not confused with buttons.

Keyboard focus uses warning-colored emphasis. Hover uses start-colored emphasis. Selected, checked, and switched-on states bias toward mid. Disabled controls lose elevation, use dashed borders or tracks, keep their tone family muted, and do not animate as active controls.

Motion should stay fast and restrained. The baseline transition timing is 120ms ease-out.

## Shapes

Use restrained rounding. Medium radius is the default for controls and cards. Large radius is for panels. Full pill radius is reserved for badges, small state labels, slider tracks, switch tracks, and compact metadata chips.

Do not mix sharp industrial corners with heavily rounded decorative shapes. Do not add decorative gradient orbs, bokeh blobs, or ornamental background shapes.

## Components

Buttons are raised keycaps. Primary buttons use start. Secondary informational buttons use mid. Ghost buttons use neutral control surfaces but keep the same pressable chrome. Destructive buttons should use danger only when the action is truly destructive.

Badges, helper labels, and status tags are passive. They should be smaller, flatter, and dot-marked where useful. They should never compete visually with primary buttons.

Inputs, selects, and textareas use neutral control backgrounds, crisp borders, and theme text. Hover may bias toward start. Focus must bias toward warning. Tone-specific inputs may use tone fill and border, but they should still read as inputs.

Switches, checkboxes, radios, sliders, tabs, alerts, tables, swatches, and code blocks should inherit from the shared token set. Selected table rows may use row-level semantic tones, but the selected color must map back to a defined semantic or accent token.

Function accent chips are controls, not labels. They should use the same raised chrome as buttons while preserving their secondary accent family.

## Do and Do Not

- Do read design.md and style.md before making UI changes in a consuming project.
- Do keep theme and font state on the root element.
- Do reuse existing tokens before inventing a local color or radius.
- Do preserve the meanings of start, mid, warning, and danger.
- Do make pressable controls visibly different from passive labels.
- Do update this file when reusable design tokens or component rules change.
- Do not replace the real app surface with a marketing landing page.
- Do not use gradients, decorative blobs, or one-note palettes by default.
- Do not hardcode random accent colors when a semantic tone or secondary accent fits.
- Do not create per-component theme systems if the root theme can handle it.
- Do not allow text to overflow buttons, cards, tabs, or compact panels.

---
version: alpha
name: Phox-Styleguide
description: Standalone, machine-readable reconstruction contract for the Phox-Styleguide monospace light/dark technical UI.
source-of-truth: design.md
reconstruction:
  fidelity: "Reproduce the complete reference page structure, styling, states, accessibility, and behavior from this file alone."
  defaultTheme: dark
  defaultFont: system-stack
  defaultContentWidth: standard
  rootAttributes:
    theme: data-theme
    font: data-font
    contentWidth: data-content-width
  persistence:
    theme: phox-styleguide-theme
    font: phox-styleguide-font
    contentWidth: phox-styleguide-content-width
  responsiveBreakpoint: "800px"
themes:
  dark:
    colorScheme: dark
    colors:
      bg: "#040506"
      bgElevated: "#090b0f"
      panel: "#0c1014"
      panelStrong: "#10161c"
      border: "#202835"
      borderStrong: "#364255"
      text: "#eef6ff"
      textMuted: "#a4b0c2"
      textFaint: "#667388"
      start: "#00b6ff"
      startSoft: "rgba(0, 182, 255, 0.2)"
      startBorder: "rgba(0, 182, 255, 0.62)"
      startFill: "rgba(0, 182, 255, 0.18)"
      startFillStrong: "rgba(0, 182, 255, 0.28)"
      startInk: "#d8f9ff"
      mid: "#39ff79"
      midSoft: "rgba(57, 255, 121, 0.18)"
      midBorder: "rgba(57, 255, 121, 0.62)"
      midFill: "rgba(57, 255, 121, 0.16)"
      midFillStrong: "rgba(57, 255, 121, 0.22)"
      midInk: "#e0ffe8"
      warning: "#ffbc3a"
      warningSoft: "rgba(255, 188, 58, 0.2)"
      warningBorder: "rgba(255, 188, 58, 0.5)"
      warningFill: "rgba(255, 188, 58, 0.16)"
      warningFillStrong: "rgba(255, 188, 58, 0.24)"
      warningInk: "#fff0d2"
      danger: "#ff1f5a"
      dangerSoft: "rgba(255, 31, 90, 0.28)"
      dangerBorder: "rgba(255, 31, 90, 0.72)"
      dangerFill: "rgba(255, 31, 90, 0.24)"
      dangerFillStrong: "rgba(255, 31, 90, 0.3)"
      dangerInk: "#ffe0e8"
      dangerGlow: "rgba(255, 31, 90, 0.08)"
      backdrop: "rgba(4, 5, 6, 0.72)"
      accentAlpha: "#b86cff"
      accentAlphaSoft: "rgba(184, 108, 255, 0.18)"
      accentAlphaBorder: "rgba(184, 108, 255, 0.58)"
      accentAlphaFill: "rgba(184, 108, 255, 0.14)"
      accentAlphaFillStrong: "rgba(184, 108, 255, 0.24)"
      accentAlphaInk: "#f7ecff"
      accentBeta: "#ff6fce"
      accentBetaSoft: "rgba(255, 111, 206, 0.18)"
      accentBetaBorder: "rgba(255, 111, 206, 0.58)"
      accentBetaFill: "rgba(255, 111, 206, 0.14)"
      accentBetaFillStrong: "rgba(255, 111, 206, 0.24)"
      accentBetaInk: "#ffeffa"
      accentGamma: "#c37c50"
      accentGammaSoft: "rgba(195, 124, 80, 0.18)"
      accentGammaBorder: "rgba(195, 124, 80, 0.56)"
      accentGammaFill: "rgba(195, 124, 80, 0.14)"
      accentGammaFillStrong: "rgba(195, 124, 80, 0.22)"
      accentGammaInk: "#fff0e6"
      accentNeutral: "#d0d7e2"
      accentNeutralSoft: "rgba(208, 215, 226, 0.12)"
      accentNeutralBorder: "rgba(208, 215, 226, 0.34)"
      accentNeutralFill: "rgba(208, 215, 226, 0.08)"
      accentNeutralFillStrong: "rgba(208, 215, 226, 0.14)"
      accentNeutralInk: "#f5f8fc"
      linkHover: "#89e9ff"
      inlineCodeBg: "rgba(0, 182, 255, 0.12)"
      inlineCodeText: "#c4f6ff"
      neutralFill: "rgba(255, 255, 255, 0.02)"
      controlBg: "#07090c"
      controlStrong: "#11161d"
      controlTopGlint: "rgba(255, 255, 255, 0.18)"
      controlBottomShade: "rgba(0, 0, 0, 0.28)"
      controlThumbBorder: "rgba(255, 255, 255, 0.12)"
      switchThumbActive: "#d8fff4"
      preBg: "#07090c"
      preText: "#c7f6ff"
      toneGlint: "rgba(255, 255, 255, 0.02)"
      toneSwitchBase: "rgba(255, 255, 255, 0.03)"
      alertGlint: "rgba(255, 255, 255, 0.015)"
    shadows:
      panel: "0 18px 40px rgba(0, 0, 0, 0.34)"
      hover: "0 0 0 1px rgba(0, 182, 255, 0.2)"
      focus: "0 0 0 3px rgba(255, 188, 58, 0.28)"
      controlRest: "inset 0 1px 0 rgba(255, 255, 255, 0.16), inset 0 -2px 0 rgba(0, 0, 0, 0.42), 0 0.28rem 0 rgba(0, 0, 0, 0.46)"
      controlHover: "inset 0 1px 0 rgba(255, 255, 255, 0.22), inset 0 -2px 0 rgba(0, 0, 0, 0.48), 0 0.32rem 0 rgba(0, 0, 0, 0.5)"
      controlActive: "inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 2px 6px rgba(0, 0, 0, 0.34), inset 0 0 0 1px rgba(0, 0, 0, 0.2), 0 0.08rem 0 rgba(0, 0, 0, 0.38)"
      linkHover: "0 0 10px rgba(0, 182, 255, 0.28)"
  light:
    colorScheme: light
    colors:
      bg: "#eef3f9"
      bgElevated: "#ffffff"
      panel: "#f8fbff"
      panelStrong: "#edf3fa"
      border: "#c8d4e3"
      borderStrong: "#a6b6c9"
      text: "#132237"
      textMuted: "#465a73"
      textFaint: "#72839b"
      start: "#007edb"
      startSoft: "rgba(0, 126, 219, 0.12)"
      startBorder: "rgba(0, 126, 219, 0.36)"
      startFill: "rgba(0, 126, 219, 0.1)"
      startFillStrong: "rgba(0, 126, 219, 0.16)"
      startInk: "#005589"
      mid: "#12b84b"
      midSoft: "rgba(18, 184, 75, 0.12)"
      midBorder: "rgba(18, 184, 75, 0.36)"
      midFill: "rgba(18, 184, 75, 0.1)"
      midFillStrong: "rgba(18, 184, 75, 0.15)"
      midInk: "#0c6b2e"
      warning: "#cc7a00"
      warningSoft: "rgba(204, 122, 0, 0.14)"
      warningBorder: "rgba(204, 122, 0, 0.36)"
      warningFill: "rgba(204, 122, 0, 0.12)"
      warningFillStrong: "rgba(204, 122, 0, 0.16)"
      warningInk: "#8a5800"
      danger: "#cc1f4d"
      dangerSoft: "rgba(204, 31, 77, 0.16)"
      dangerBorder: "rgba(204, 31, 77, 0.38)"
      dangerFill: "rgba(204, 31, 77, 0.14)"
      dangerFillStrong: "rgba(204, 31, 77, 0.2)"
      dangerInk: "#91153a"
      dangerGlow: "rgba(204, 31, 77, 0.06)"
      backdrop: "rgba(19, 34, 55, 0.34)"
      accentAlpha: "#7b46e1"
      accentAlphaSoft: "rgba(123, 70, 225, 0.1)"
      accentAlphaBorder: "rgba(123, 70, 225, 0.34)"
      accentAlphaFill: "rgba(123, 70, 225, 0.1)"
      accentAlphaFillStrong: "rgba(123, 70, 225, 0.16)"
      accentAlphaInk: "#562eb2"
      accentBeta: "#cf4fad"
      accentBetaSoft: "rgba(207, 79, 173, 0.1)"
      accentBetaBorder: "rgba(207, 79, 173, 0.34)"
      accentBetaFill: "rgba(207, 79, 173, 0.1)"
      accentBetaFillStrong: "rgba(207, 79, 173, 0.16)"
      accentBetaInk: "#9a2f7d"
      accentGamma: "#9c613a"
      accentGammaSoft: "rgba(156, 97, 58, 0.12)"
      accentGammaBorder: "rgba(156, 97, 58, 0.34)"
      accentGammaFill: "rgba(156, 97, 58, 0.1)"
      accentGammaFillStrong: "rgba(156, 97, 58, 0.14)"
      accentGammaInk: "#74421d"
      accentNeutral: "#6b7888"
      accentNeutralSoft: "rgba(107, 120, 136, 0.1)"
      accentNeutralBorder: "rgba(107, 120, 136, 0.28)"
      accentNeutralFill: "rgba(107, 120, 136, 0.08)"
      accentNeutralFillStrong: "rgba(107, 120, 136, 0.12)"
      accentNeutralInk: "#3f4c5c"
      linkHover: "#005e9d"
      inlineCodeBg: "rgba(0, 126, 219, 0.1)"
      inlineCodeText: "#005589"
      neutralFill: "rgba(16, 32, 55, 0.04)"
      controlBg: "#ffffff"
      controlStrong: "#dce6f1"
      controlTopGlint: "rgba(255, 255, 255, 0.94)"
      controlBottomShade: "rgba(82, 103, 128, 0.22)"
      controlThumbBorder: "rgba(16, 32, 55, 0.16)"
      switchThumbActive: "#ffffff"
      preBg: "#edf4fb"
      preText: "#0b5e8f"
      toneGlint: "rgba(16, 32, 55, 0.04)"
      toneSwitchBase: "rgba(16, 32, 55, 0.04)"
      alertGlint: "rgba(16, 32, 55, 0.04)"
    shadows:
      panel: "0 12px 28px rgba(16, 32, 55, 0.08)"
      hover: "0 0 0 1px rgba(0, 126, 219, 0.14)"
      focus: "0 0 0 3px rgba(204, 122, 0, 0.2)"
      controlRest: "inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -2px 0 rgba(166, 182, 201, 0.44), 0 0.24rem 0 rgba(137, 154, 174, 0.44)"
      controlHover: "inset 0 1px 0 rgba(255, 255, 255, 0.96), inset 0 -2px 0 rgba(150, 168, 190, 0.5), 0 0.28rem 0 rgba(137, 154, 174, 0.5)"
      controlActive: "inset 0 1px 0 rgba(255, 255, 255, 0.58), inset 0 2px 6px rgba(137, 154, 174, 0.24), inset 0 0 0 1px rgba(16, 32, 55, 0.08), 0 0.08rem 0 rgba(137, 154, 174, 0.34)"
      linkHover: none
typography:
  defaultStack: "ui-monospace, SF Mono, SFMono-Regular, Menlo, Monaco, Cascadia Mono, Cascadia Code, Consolas, Lucida Console, Roboto Mono, Droid Sans Mono, Noto Sans Mono, Ubuntu Mono, DejaVu Sans Mono, Liberation Mono, Courier New, monospace"
  fontOptions:
    system-stack: "ui-monospace, SF Mono, SFMono-Regular, Menlo, Monaco, Cascadia Mono, Cascadia Code, Consolas, Lucida Console, Roboto Mono, Droid Sans Mono, Noto Sans Mono, Ubuntu Mono, DejaVu Sans Mono, Liberation Mono, Courier New, monospace"
    ui-mono: "ui-monospace, monospace"
    generic-mono: "monospace"
    sf-mono: "SF Mono, SFMono-Regular, Menlo, Monaco, monospace"
    menlo: "Menlo, SF Mono, SFMono-Regular, Monaco, monospace"
    monaco: "Monaco, Menlo, SF Mono, SFMono-Regular, monospace"
    cascadia-mono: "Cascadia Mono, Cascadia Code, Consolas, Lucida Console, monospace"
    consolas: "Consolas, Lucida Console, Courier New, monospace"
    lucida-console: "Lucida Console, Consolas, Courier New, monospace"
    courier-new: "Courier New, Courier, monospace"
    roboto-mono: "Roboto Mono, Droid Sans Mono, Noto Sans Mono, monospace"
    droid-sans-mono: "Droid Sans Mono, Roboto Mono, Noto Sans Mono, monospace"
    noto-sans-mono: "Noto Sans Mono, Roboto Mono, Droid Sans Mono, monospace"
    ubuntu-mono: "Ubuntu Mono, DejaVu Sans Mono, Liberation Mono, monospace"
    dejavu-sans-mono: "DejaVu Sans Mono, Noto Sans Mono, Liberation Mono, monospace"
    liberation-mono: "Liberation Mono, DejaVu Sans Mono, Ubuntu Mono, monospace"
  body:
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0"
  display:
    fontSize: "clamp(2rem, 4vw, 3.5rem)"
    fontWeight: 700
    letterSpacing: "-0.04em"
  sectionHeading:
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
  cardHeading:
    fontSize: "1.1rem"
    fontWeight: 700
  label:
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.12em"
    textTransform: uppercase
  badge:
    fontSize: "0.68rem"
    fontWeight: 700
    letterSpacing: "0.12em"
    textTransform: uppercase
shape:
  radiusSm: "0.45rem"
  radiusMd: "0.8rem"
  radiusLg: "1.25rem"
  radiusPill: "999px"
spacing:
  space1: "0.25rem"
  space2: "0.5rem"
  space3: "0.75rem"
  space4: "1rem"
  space5: "1.5rem"
  space6: "2rem"
  space7: "3rem"
layout:
  widths:
    min: "48rem"
    "1080": "1080px"
    standard: "76rem"
    "1440": "1440px"
    "1920": "1920px"
    full: "100%"
  desktopGutter: "2rem"
  mobileGutter: "1rem"
  fullWidthGutter: "0"
  pagePaddingDesktop: "3rem 0"
  pagePaddingMobile: "1.5rem 0"
  sectionGap: "1.5rem"
motion:
  transition: "120ms ease-out"
  controlHoverTranslateY: "-0.06rem"
  controlActiveTranslateY: "0.16rem"
semanticTones:
  start: "primary actions, initial states, active affordance, and hover energy"
  mid: "information, in-progress, checked, selected, and switched-on state"
  warning: "caution, review, keyboard focus, and 75 percent state"
  danger: "destructive action, terminal state, and error"
secondaryAccents:
  neutral: "baseline and non-semantic utility grouping"
  alpha: "secondary grouping family A"
  beta: "secondary grouping family B"
  gamma: "warm secondary grouping family C; never a warning substitute"
components:
  panel:
    background: panel
    border: "1px solid border"
    radius: radiusLg
    paddingDesktop: "2rem"
    paddingMobile: "1rem"
    shadow: panel
  card:
    background: bgElevated
    border: "1px solid border"
    radius: radiusMd
    padding: "1rem"
  button:
    minHeight: "2.35rem"
    padding: "0.45rem 0.75rem 0.4rem"
    borderWidth: "1px 1px 0.2rem"
    radius: radiusMd
    fontWeight: 700
    letterSpacing: "0.02em"
  field:
    minHeight: "2.9rem"
    padding: "0.8rem 0.9rem"
    border: "1px solid border"
    radius: radiusMd
    textareaMinHeight: "8rem"
  tab:
    minHeight: "2.75rem"
    padding: "0.78rem 1rem 0.72rem"
    borderWidth: "1px 1px 0.24rem"
  switch:
    size: "3.5rem by 2rem"
    thumbSize: "1.35rem"
    thumbInset: "0.2rem"
    checkedTravel: "1.45rem"
  range:
    trackHeight: "0.5rem"
    thumbSize: "1.2rem"
  badge:
    minHeight: "1.5rem"
    padding: "0.18rem 0.55rem 0.18rem 0.42rem"
    dotSize: "0.45rem"
  alert:
    padding: "0.9rem 1rem"
  progressMeter:
    height: "0.85rem"
  disclosure:
    summaryMinHeight: "2.9rem"
    summaryPadding: "0.85rem 1rem"
    bodyPadding: "0.75rem"
  dropdownMultiSelect:
    menuOffset: "0.35rem"
    menuPadding: "0.7rem"
    menuMinWidth: "min(24rem, calc(100vw - 2rem))"
  searchableGroupedSelect:
    popoverWidth: "min(32rem, calc(100vw - 3rem))"
    popoverPadding: "0.7rem"
    listMaxHeight: "18rem"
  removableBadgeAction:
    minHeight: "1.7rem"
    padding: "0.34rem 0.7rem 0.3rem"
    borderWidth: "1px 1px 0.18rem"
  modal:
    width: "min(46rem, calc(100% - 2rem))"
    maxHeight: "min(90vh, 56rem)"
    padding: "1.5rem"
    backdropBlur: "4px"
    textMinHeight: "14rem"
  inspectionCellButton:
    minHeight: "3.7rem"
    lineClamp: 3
  swatch:
    minHeight: "5rem"
  swatchToggle:
    minHeight: "5rem"
    minimumGridColumn: "6.5rem"
    selectedIndicatorSize: "0.62rem"
---

# Phox-Styleguide Standalone Design Contract

## Reconstruction mandate

This document is the complete source of truth for recreating the reference interface. A consumer must not need the original HTML, CSS, JavaScript, another Markdown file, or unstated visual assumptions. Reproduce the root state model, ordered page anatomy, component inventory, exact token values, interaction behavior, accessibility semantics, and responsive changes specified below.

The result is a compact technical style-guide UI, not a marketing page. It uses monochrome structure, flat layered surfaces, semantic neon tones, full-page monospace typography, and raised keycap geometry for actions. Do not introduce gradients, decorative blobs, ornamental artwork, ambient control glows beyond the explicitly documented function-chip and status-dot halos, or unrelated accent colors.

## Root and document contract

Use an HTML document titled **Phox-Styleguide**, with language set to English, UTF-8 encoding, and the standard responsive viewport declaration. The root element starts with `data-theme="dark"`, `data-font="system-stack"`, and `data-content-width="standard"`. Set `color-scheme` from the active theme.

Before the first paint, read the three persistence keys in the YAML front matter. Apply a saved theme only when it is `light` or `dark`; apply a saved font only when it is one of the listed font options; apply a saved width only when it is one of the six supported values. Invalid or unavailable saved state falls back to the defaults. Storage failures must not break the page.

Apply `box-sizing: border-box` to every element and pseudo-element. The document and body use the active background, active text, and selected page-wide mono stack. The body has zero margin and a minimum height of `100vh`. Buttons, inputs, selects, textareas, progress, meter, and dialogs inherit the page font. Text selection uses the active start color as its background and the page background as its text color.

All panels, cards, choice groups, table wrappers, alerts, swatches, tabs, buttons, swatch toggles, function chips, disclosures, multi-select containers/options, badge actions, inspection cell buttons, dialogs, fields, and switch tracks transition background color, border color, box shadow, text color, and transform with the shared `120ms ease-out` timing.

## Toolbar state and option contract

The theme control is a raised button with a `10rem` minimum width. Its left label is “Theme”; its right state is a `1.5rem`-minimum pill with `0.1rem 0.55rem` padding, start border/fill/ink, `0.75rem` uppercase text, and `0.1em` tracking. Dark sets `aria-pressed="false"`, state text “Dark,” and the Forms heading helper to “dark theme active.” Light sets `aria-pressed="true"`, state text “Light,” and that helper to “light theme active.” Clicking toggles the root theme and persists the new value.

Toolbar fields are one-column grids with `0.5rem` gaps. Desktop toolbar selects span the available width and have an `18rem` minimum width. The font selector groups options exactly as follows:

- Browser / System: System Mono Stack (`system-stack`), UI Monospace (`ui-mono`), Generic Monospace (`generic-mono`).
- Apple: SF Mono / SFMono-Regular (`sf-mono`), Menlo (`menlo`), Monaco (`monaco`).
- Windows: Cascadia Mono / Code (`cascadia-mono`), Consolas (`consolas`), Lucida Console (`lucida-console`), Courier New (`courier-new`).
- Android / ChromeOS: Roboto Mono (`roboto-mono`), Droid Sans Mono (`droid-sans-mono`), Noto Sans Mono (`noto-sans-mono`).
- Linux: Ubuntu Mono (`ubuntu-mono`), DejaVu Sans Mono (`dejavu-sans-mono`), Liberation Mono (`liberation-mono`).

The content-width selector labels are Narrow reading width (`min`), App viewport / 1080px (`1080`), Default guide width (`standard`), Wide workspace / 1440px (`1440`), Large display / 1920px (`1920`), and Full browser width (`full`). Font and width changes update the matching root attribute immediately, keep the selector value synchronized, and persist the valid value. Unknown runtime values fall back to `system-stack` or `standard`.

## Color and state model

The complete theme values are normative in the YAML front matter. Every tone has a base, soft, border, fill, strong fill, and ink role. Use those roles consistently rather than calculating new colors.

- **Start** is blue: primary action, hover energy, initial state, and active affordance.
- **Mid** is green: informational, selected, checked, switched-on, and in-progress state.
- **Warning** is amber: keyboard focus, review, caution, and 75 percent state.
- **Danger** is red: destructive, terminal, and error state.
- **Neutral, alpha, beta, and gamma** are non-semantic grouping families. They may organize functions, alerts, stats, table rows, and swatches, but must never replace the four status tones.

Blue and green must remain visibly distinct. Green and amber must remain visibly distinct for users with green-yellow confusion. Danger must read as red rather than pink. Gamma stays earthier and browner than warning. No component may create its own theme switch or tone meaning.

## Typography

Everything is monospace: display type, headings, paragraphs, controls, options, labels, tables, badges, helper text, code, and form values. A root font change updates the entire page.

The hero display is `clamp(2rem, 4vw, 3.5rem)`, bold, with `-0.04em` tracking. Section headings are approximately `1.5rem`; tone and combination card headings are `1.1rem`. Body and table copy use `1.6` line-height and muted text where secondary. Eyebrows, kickers, toolbar labels, and helper text use `0.75rem`, uppercase, and `0.12em` tracking. Badges use `0.68rem`, bold, uppercase, and `0.12em` tracking. Do not use negative tracking outside the hero display.

Links use start color, switch to `linkHover` on hover, and use the theme link shadow. Keyboard focus is a warning-colored crisp ring. Inline code uses `inlineCodeBg` and `inlineCodeText`; code blocks use `preBg` and `preText`, a medium radius, a standard border, `1rem` padding, and horizontal overflow.

## Page shell and exact page anatomy

The main shell is `min(100% - desktop gutter, selected content width)`, centered, with `3rem` vertical padding. It is a one-column grid with `1.5rem` between the hero and every following section. Full width removes both desktop and mobile gutters.

Build the following content in this order:

1. **Hero panel — “Light + Dark UI Baseline.”** Use eyebrow “Phox-Styleguide / Theme Tokens,” explanatory copy, and a two-column desktop layout (`minmax(0, 1.8fr)` and `minmax(16rem, 1fr)`). The right side contains a theme toggle, grouped font selector, content-width selector, root-scope helper text, and Start, Mid / Info, Ghost, and Disabled action examples.
2. **Typography — “Text Samples.”** Use two cards: one demonstrates a heading and paragraph; one demonstrates start-tone inline text, a link, inline code, and Neutral, Start, Mid / Info, 75% / Warning, and End / Error badges.
3. **Controls — “Form Elements.”** Show primary, secondary, ghost, and disabled buttons; text, email, password, search, textarea, and select fields; checked and unchecked checkboxes and radios; a live range/output pair initialized to 56; and a checked switch with live “enabled” text. Explain that actions are raised while labels are flat.
4. **Variants — “Tone Control Sets.”** Use four tone cards for Start/Blue, Mid/Green, Warning/Amber, and Danger/Red. Every card includes its tone badge, button, input, range/output, checked checkbox, checked radio, and switch. Initial range values are 28, 54, 76, and 92. The danger switch starts unchecked; the other three start checked.
5. **Functions — “Function Accent Sets.”** First show four raised chips for neutral, alpha, beta, and gamma. Then show four accent cards. Each contains a flat accent badge, raised button, input, select, checked checkbox, checked radio, and switch. Neutral, alpha, and beta switches start checked; gamma starts unchecked. State clearly that these families group functions and are not statuses.
6. **States — “Hover, Focus, Selected & Disabled.”** Use a four-tab tone example, a state legend card, and a disabled-actions card. The tabs are Start, Mid / Info, 75% / Warning, and End / Error; Start is initially selected.
7. **Disabled — “Disabled Control Sets.”** Show all eight families: start, mid, warning, danger, neutral, alpha, beta, and gamma. Each family keeps its tone while muted and includes a disabled button, input, select, range, checked checkbox, checked radio, and checked switch.
8. **Feedback — “Status & Data.”** Show semantic alerts for all four status tones, accent alerts for all four secondary families, start-colored progress at 34%, warning-colored meter at 78%, four accent stat cards, and a horizontally scrollable state table. The table contains neutral/start/mid/warning/danger/alpha/beta/gamma rows with row checkboxes, badges, usage copy, and their primary token names. Seed neutral, mid, alpha, and gamma as selected.
9. **Data Review — “Dense Record Inspection.”** Show open and closed disclosure panels, a four-option dropdown multi-select with three selected, a grouped searchable single-select with Workspaces and Teams groups, removable assignment badges, a full-value dialog trigger, and a dense inspection table whose clipped Record and Value Preview cells open the same dialog.
10. **Contrast — “Cross-Paired Color Mixes.”** Show six cards: Mid On Start, Start On Mid, Warning On Error, Neutral On Alpha, Alpha On Beta, and Neutral On Gamma. Background, border, heading, kicker, and body copy use the named strong-fill/border/ink pair exactly.
11. **Layout — “Blocks & Lists.”** Show passive swatches and large toggle-button swatches for bg, panel, neutral, start, mid, warning, danger/end, alpha, beta, and gamma. Follow with a short rules list and a code-block sample of core tokens.

The hero is fixed at the top of the document order. Every one of the ten following section panels is independently reorderable and collapsible at runtime.

## Surfaces and layout primitives

Panels use the active panel color, standard border, large radius, panel shadow, and `2rem` desktop padding. Hover changes only the border toward start and combines the panel and crisp hover shadows. Cards, choice groups, and tab panels use the elevated background, standard border, medium radius, and `1rem` padding. Avoid cards inside cards except where this reconstruction explicitly identifies a card as the container for controls; use spacing and border hierarchy instead of arbitrary nested decoration.

Reusable auto-fit grids use these minimum column widths:

- type, feedback, layout, state, and contrast grids: `16rem`
- form grid: `15rem`
- semantic/accent tone grids: `17rem`
- function-chip grid: `8rem`
- stats: `9rem`
- inspection controls: `18rem`
- swatch-toggle grid: `6.5rem`

All grid gaps are `1rem` except function chips, stats, swatch toggles, stacks, and compact rows, which use `0.75rem` unless an exact component rule says otherwise. An action row followed by content must reserve at least `1rem` of real layout space; a control shadow is never spacing.

Fixed-format toolbars, tab groups, counters, tables, and button groups must use stable dimensions or wrapping so state text does not resize the surrounding layout. Clamp or wrap long text; never let it escape buttons, cards, tabs, tables, or compact panels.

## Pressable controls

Buttons, tabs, function chips, removable badge actions, and swatch toggles are raised keycaps. At rest they have a visible one-pixel top glint, a one-pixel bottom shade, a heavy bottom border, the theme `controlRest` shadow, and no blurred exterior glow. Hover biases toward start unless the component intentionally preserves a semantic or accent family, raises by `0.06rem`, and uses `controlHover`. Active state moves down `0.16rem` and uses `controlActive`. Keyboard focus uses a crisp warning outline or warning focus shadow without replacing the underlying tone.

The neutral button surface is `panelStrong`; primary uses start strong fill/border/ink; secondary uses mid strong fill/border/ink; ghost uses `controlBg` and the neutral border. Buttons are inline-flex, centered, bold, and use the exact metrics from the YAML. Destructive styling is reserved for truly destructive actions.

Function chips use their accent fill, border, and ink, uppercase `0.08em` tracking, `3rem` minimum height, `0.75rem 0.85rem 0.68rem` padding, and a `0.24rem` bottom border. Their hover is the intentional control-halo exception: combine `controlHover` with `0 0 0 1px accentSoft` and `0 0 14px accentSoft`. Accent badges remain flat even beside raised accent chips.

Disabled controls keep their underlying tone family but use `0.42` opacity, `saturate(0.15)`, dashed borders or tracks, no top/bottom glints, no shadow, no hover/active translation, and a not-allowed cursor. Disabled checkbox/radio labels use `0.68` opacity. Disabled does not mean converting every family to the same gray.

## Passive labels and badges

Badges are flat inline-flex pills with the exact YAML metrics, a standard border, neutral fill, inset one-pixel glint, and a `0.45rem` status dot. Semantic badges map dot, border, and ink to their tone. Accent badges map the same roles to neutral, alpha, beta, or gamma. Badges and helper labels must never visually compete with primary controls.

A removable badge may contain one nested **Remove** action. Keep the outer badge flat and label-like; only the inner action receives raised keycap geometry, the mid action family, pointer cursor, and warning focus ring. Removing the final badge replaces the row with uppercase helper text “all assignments removed.”

## Fields, choices, ranges, and switches

Text-like inputs, selects, and textareas use `controlBg`, the neutral border, active text, medium radius, and the exact field dimensions. Placeholder text uses `textFaint`. Hover biases the border and surface toward start; keyboard focus changes the border and crisp focus ring to warning. Textareas resize vertically. Tone inputs use the owning tone soft fill, border, and ink while retaining field geometry.

Checkboxes and radios use native semantics and mid as the neutral checked accent; tone cards override the checked accent with their owning tone. Choices are flex rows with `0.5rem` gaps and muted labels that become full text on hover.

Ranges have a `0.5rem` pill track, `1.2rem` circular thumb, and `1.4rem` minimum control height. The neutral range uses a start thumb; a tone range uses its tone thumb and border plus a `0.2rem` soft halo. Support both WebKit and Firefox track/thumb styling. Live examples update their paired output on every input event.

Switches are `3.5rem` by `2rem` pills with a `1.35rem` thumb. Hover biases to start, focus uses warning, checked state uses mid, and the thumb travels `1.45rem`. Tone switches preserve the owning tone for hover, checked track, border, and active thumb. Every labeled demo switch updates adjacent text to exactly “enabled” or “disabled” after changes.

## Tabs

Tabs use raised keycap geometry and the exact tab metrics. Hover is start, focus is warning, and active press is mid. A selected tab keeps its assigned semantic tone rather than all selected tabs becoming green.

Use `role="tablist"`, `role="tab"`, and `role="tabpanel"`; connect tabs and panels with `aria-controls` and `aria-labelledby`. Exactly one tab has `aria-selected="true"` and `tabindex="0"`; all others have `aria-selected="false"`, `tabindex="-1"`, and hidden panels. Click selects without forced focus. Arrow Left/Right wrap, Home selects the first, End selects the last, and keyboard selection moves focus.

## Alerts, progress, meters, stats, and tables

Semantic alerts use their tone fill, border, and ink. Danger alone may add the restrained `dangerGlow` because it signals an error rather than control elevation. Accent alerts and stats use the selected accent fill, border, and ink. Alerts use `0.9rem 1rem` padding; stats use a medium radius, `0.75rem` padding, `6.25rem` minimum height, `1.45rem` value text, and `0.82rem` metadata.

Progress and meter are full width and `0.85rem` high. Progress uses a start fill. Meter uses a warning fill. Both use pill geometry; progress includes a standard border and control background.

Tables are full width with collapsed borders, left-aligned cells, `0.95rem 1rem` cell padding, and a strong-panel header. The normal state table has a `46rem` minimum width; compact disclosure tables use a `32rem` minimum width and `0.65rem 0.75rem` cells; inspection tables use a `42rem` minimum width. Wrap tables in an elevated, bordered, horizontally scrollable medium-radius surface.

Each tone row maps base, soft, strong fill, border, and ink from its semantic or accent family. Hover uses soft fill. Checkbox selection writes both `data-selected` and `aria-selected` on the row; selected rows use strong fill and tone ink. A selected-and-hovered row adds an inset border. The row checkbox uses that row’s base color.

## Disclosures and multi-select

Use native `details` and `summary` for disclosure and dropdown multi-select open state. The container uses elevated background, standard border, medium radius, and a subtle inset glint. The summary is a stable `2.9rem`-minimum uppercase row. Hide the browser marker and add a trailing `>` chevron: closed is unrotated/faint; open rotates 90 degrees and turns mid. Focus is warning. Open summaries receive a bottom border.

Disclosure bodies are the continuation of the same surface, not nested decorative cards. Use a `0.75rem` grid gap/padding and muted paragraphs. The sample Inherited Filters disclosure starts open with a “3 active” mid badge and compact table; Review Notes starts closed with a warning badge.

The dropdown multi-select opens an absolute menu `0.35rem` below its summary on desktop. The menu uses strong-panel background, panel shadow, `0.7rem` padding, and two equal-width raised **All**/**None** actions. Options use a small-radius bordered row with a hidden native checkbox, custom marker, pill code, and label. Hover uses start, focus-within uses warning, selected uses mid fill/border/ink, and the selected marker is inset-filled with mid.

The summary is exactly “No options selected,” “{value} selected,” or “{count} options selected” for zero, one, or multiple selections. All and None update every checkbox and the summary. Clicking outside closes every open multi-select.

## Searchable grouped select

This is a single-select combobox for longer grouped sets. The trigger looks like a full-width field with bold text and a chevron; start is hover, warning is focus, and the open chevron rotates 90 degrees and turns mid. The desktop popover is absolute, right-aligned, `0.35rem` below the trigger, and uses the exact YAML dimensions. Put the search input first and a scrolling listbox below it.

The reference data has two groups: **Workspaces** (Atlas — Planning workspace; Beacon — Research workspace; Cedar — Shared reference space) and **Teams** (Design — Interface standards; Operations — Service review; Support — Request queue). Atlas is initially selected and active, and the trigger reads “Atlas · Planning workspace.” Each option has a two-letter pill code, label, and supporting description.

Match a case-insensitive query against the combined label and description. Hide non-matching options and groups with no matches. The listbox has an `18rem` maximum height, contained overscroll, and themed scrollbar. Display “No matching options” in a dashed empty panel at zero results. A visually hidden polite status region announces “1 option available” or “{count} options available.”

Use `aria-haspopup="listbox"` and `aria-expanded` on the trigger. The search input has `role="combobox"`, `aria-autocomplete="list"`, and controls the `role="listbox"`. Groups use `role="group"`; items use `role="option"` and `aria-selected`. Mirror the keyboard-active option ID into `aria-activedescendant`.

Clicking the trigger opens/closes and focuses search when opening. Arrow Down/Up on a closed trigger opens and moves the active option. In search, Arrow Down/Up wrap through visible options; Home/End jump; Enter commits the active visible option; Escape closes and returns focus to the trigger. Pointer movement updates the active option, clicking commits it, and clicking outside closes. Active/hover uses start; committed selection uses mid; selected plus active uses the stronger start treatment. Closing clears the query and restores all results.

## Section move and collapse controls

At runtime, add an unlabeled visual cluster to the trailing edge of each section heading after the hero. It contains three `2.35rem` square ghost keycaps in this order: `↑`, `↓`, `−`. Give the cluster an accessible label based on the section title. Every icon button receives matching `aria-label` and `title` text such as “Move Typography section up.”

Disable Up on the first current section and Down on the last; recompute boundaries after every move. Reordering changes actual document order and keeps interaction on the moved control. Collapse toggles an `is-collapsed` state that hides everything except the heading, removes heading bottom margin, changes `−` to `+`, changes the label between Collapse and Expand, and mirrors visibility with `aria-expanded`. The hero cannot be moved or collapsed.

## Inspection dialog and cell actions

Inspection cell buttons are transparent, inherit the row tone, fill the cell width, have a `3.7rem` minimum height, wrap long words, and clamp previews to three lines. Hover uses the row tone’s soft fill/border/ink. Focus is an inset two-pixel warning ring. Their low chrome must preserve dense table scanning.

Every inspection trigger supplies a title, description, copy-button label, and full raw value. Opening populates a native `dialog`, calls `showModal` when supported, sets status to “ready,” and focuses the readonly textarea. The dialog uses panel styling, the exact YAML dimensions, a close form/button, vertically resizable readonly value area, copy action, and status text. The tokenized backdrop is blurred by `4px`. Clicking the backdrop closes; native close resets status to “ready.”

Copy uses the Clipboard API. Success changes status to “copied”; no API changes it to “copy unavailable”; rejection changes it to “copy failed” and may log a warning. Keep full identifiers and payloads copyable rather than truncating their source value.

## Swatches and color-pair tests

Passive swatches are bordered medium-radius blocks, at least `5rem` high, with a bottom-left label. They are reference samples, not controls.

Large swatch toggles use the same labels and families but are buttons with `aria-pressed`. Off uses a raised keycap and the softer companion fill. On uses an inset keycap with the stronger saturated face, changes the border from a heavy bottom to a heavy top, moves down `0.12rem`, and shows a `0.62rem` mid-green status dot at the top-right with a restrained `0 0 0.75rem rgba(57, 255, 121, 0.5)` halo. Hover remains start only while off. Focus is warning in both states. For dark neutral faces, pressed/in must be darker: bg returns to `bg`, and panel returns to `panel`.

For neutral and tone on-faces, mix the base color with panel using these proportions: neutral 34%, start 46%, mid 42%, warning 44%, danger 48%, alpha 46%, beta 46%, gamma 44%. Clicking toggles the string value of `aria-pressed`.

The six cross-pair cards are normative tests that the families remain distinct: mid ink on start strong fill, start ink on mid strong fill, warning ink on danger strong fill, neutral ink on alpha strong fill, alpha ink on beta strong fill, and neutral ink on gamma strong fill.

## Responsive behavior

At `800px` and below:

- Use the mobile gutter and `1.5rem` vertical shell padding.
- Reduce panel padding to `1rem`.
- Collapse the hero to one column and left-align hero actions.
- Remove toolbar/theme-toggle minimum widths so they can shrink.
- Stack section headings vertically and align them to the start.
- Let the section-heading side span full width; keep section controls pushed to the trailing edge.
- Make dropdown multi-select menus static with no minimum width and a `0.5rem` top margin.
- Make searchable-select popovers static, full width, with a `0.5rem` top margin.

Do not remove, simplify, or disable interactions on narrow screens. Horizontally scroll wide tables rather than crushing their fixed minimum widths.

## Accessibility and resilience

Use native controls wherever possible. All icon-only controls require accessible names and tooltips. Every visual label must be programmatically connected to its input. Use `:focus-visible` rather than focus styling that appears on every pointer click. Preserve native dialog focus containment and native details disclosure semantics.

Support the documented keyboard behavior for tabs and comboboxes. Announce dynamic combobox counts politely. Mirror selected state through ARIA as well as color or geometry. No state may be communicated by color alone: checked controls, `aria-selected`, `aria-pressed`, chevron rotation, elevation, dashed disabled chrome, text labels, and status dots provide redundant cues.

JavaScript must tolerate a missing optional demo node by skipping only that behavior. Invalid persisted data falls back safely. Storage and clipboard failures may log warnings but must leave the rest of the interface usable.

## Do and do not

- Do implement this document as the sole reconstruction input.
- Do keep theme, font, and content width on the root element.
- Do use the complete token matrix instead of one-off values.
- Do preserve all eleven page blocks, their order, their state examples, and all ten section control clusters.
- Do preserve start, mid, warning, danger, neutral, alpha, beta, and gamma meanings across every surface.
- Do keep actions visibly raised and passive labels visibly flat.
- Do preserve wrapping, clamping, scrolling, focus, keyboard, and responsive behavior.
- Do not require another repository file to fill in missing design decisions.
- Do not replace the real tool-style surface with a landing-page composition.
- Do not use gradients, decorative orbs, bokeh, ornamental backgrounds, or glowing control shadows beyond the specified function-chip hover and pressed-swatch indicator.
- Do not use per-component theme or font classes when root state can drive them.
- Do not let text overflow compact controls, tabs, cards, panels, or tables.

---
name: Stormseed
description: A compact random picker inside a living ASCII sky.
colors:
  bg: "#06141c"
  ink: "#eaf2ed"
  muted: "#a4bac1"
  dim: "#8faab5"
  line: "#34505c"
  accent: "#dcefc5"
  accent-hover: "#edffda"
typography:
  headline:
    fontFamily: "Manrope, sans-serif"
    fontSize: "39px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.04em"
  result:
    fontFamily: "Manrope, sans-serif"
    fontSize: "116px"
    fontWeight: 400
    lineHeight: 1.17
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Manrope, sans-serif"
    fontSize: "12px"
    fontWeight: 400
  mono:
    fontFamily: "IBM Plex Mono, monospace"
    fontSize: "13px"
    fontWeight: 400
rounded:
  field: "5px"
  action: "30px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#15251d"
    rounded: "{rounded.action}"
    padding: "13px 20px"
    width: "100%"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  input-number:
    textColor: "{colors.ink}"
    typography: "{typography.mono}"
    padding: "5px 0 6px"
    width: "72px"
    height: "36px"
  button-quiet:
    textColor: "{colors.muted}"
    padding: "4px 2px"
---

# Design System: Stormseed

## Overview

**Creative North Star: "A living ASCII sky"**

A dark, atmospheric field of real rendered glyphs surrounds a clean, compact instrument. The sky supplies the expression; restrained controls keep the decision easy. These rules capture the finished implementation in `public/index.html`, `public/style.css`, and `public/live-sky.js`, following the approved direction in `.impeccable/review/contract.md`.

**Key Characteristics:**
- A full-screen, continuously shimmering ASCII scene.
- A centered tool with no homepage header or enclosing card.
- A bright branching bolt after each successful generation.
- Small peripheral links and progressively disclosed explanation.

## Colors

The palette pairs deep blue atmosphere with cool, readable type and a pale green action accent. Frontmatter values are normative; names below describe their application.

### Primary

- **Pale lightning green (`accent`)** marks the primary action, active-tab underline, focus outline, and current-source dot. Its lighter hover variant belongs to the primary button.
- The canvas adds teal haze and luminous cyan-to-pale-green glyphs through shader lighting, with the center deliberately darkened for reading.

### Neutral

- **Deep night (`bg`)** anchors the page and the result's soft text shadow.
- **Cloud white (`ink`)** carries the headline, result, selected mode, and field values.
- **Cool mist (`muted`)** carries supporting copy and quiet actions; **distant blue (`dim`)** carries peripheral metadata.
- **Storm edge (`line`)** separates disclosed information and outlines secondary controls.

**The Readable Center Rule.** Keep the center of the sky subdued so the instrument remains legible without an enclosing panel.

## Typography

Manrope serves the interface and large result. IBM Plex Mono distinguishes range values, tiny source metadata, and the ASCII glyph atlas. Both fonts are self-hosted and use `font-display: swap`.

The headline is modest beside the result. The intro is smaller (13px), mode labels are quiet (12px), and the result label is subordinate (10px). Numbers use tabular figures. Long results shrink (53px); list choices use a compact multiline treatment (32px) and may wrap anywhere. Preserve these content-sensitive variants rather than forcing all answers into the large numeral scale.

## Layout

The homepage stage fills at least the small viewport height (`100svh`) and centers a tool with a maximum width of 410px. Its picker is narrower (340px). Desktop stage padding reserves space for the upper link and lower metadata (110px 28px 150px). The headline, intro, mode tabs, result, settings, generate button, and result actions form one vertical sequence.

“How it works” sits at the upper right (42px from the side, 32px from the top). At the stage bottom, a three-column arrangement places the brand left, source information center, and creator right. A quiet footer follows the stage. Explanation and observation sections appear below only when opened; the explanation uses two columns within a 1040px shell.

At widths up to 700px, the instrument and picker narrow to 360px and 310px, the headline becomes 32px, and the result becomes 108px. Source information occupies its own row above the brand and creator; the ASCII caption disappears. Disclosed sections become one column. Up to 350px, side padding becomes 20px and the headline becomes 28px. At heights of at least 950px, desktop result space grows to 190px with a 132px numeral. CSS order lets mobile rules override those tall-screen values.

## Elevation & Depth

Depth comes from the animated glyph field, haze, vignette, and central darkening. The instrument has no card background, border, or box shadow. A diffuse result text shadow (`0 2px 30px #06141c`) protects its silhouette. Supporting content uses thin rules and restrained translucent fields; keep structural surfaces quiet.

## Shapes

The primary action is a broad pill. Number fields have square edges and a bottom rule; the select and textarea use the small field radius. The explanation's close control is circular. Icons are thin inline strokes, except the filled brand bolt. Dividers and selected-tab indicators are single-pixel lines.

## Components

### Buttons

The primary action spans the picker, with a bolt at the left and a small directional arrow at the right. Its minimum height is 49px, or 48px on mobile. Hover lightens the fill and lifts it 1px; press lowers it 1px. These transitions last 200ms. Disabled buttons fade to 55% opacity. Copy, Save card, and Share are quiet text actions revealed after a result; reserved space prevents the tool from jumping when they appear.

### Inputs / Fields

Range inputs are centered monospace values over a thin underline. Labels stay visible. The dice select and choice textarea use dark surfaces and subtle outlines; the textarea may resize vertically within an 86–200px height. Validation is rendered as warm pale text in a `role="alert"` region.

### Navigation

Number, Coin, Dice, and Choose form a tablist with a single understated active underline. Selection updates the matching panel and roving tab stop. Left/Right arrows and Home/End move between modes. The upper-right explanation link exposes its expanded state; closing the explanation returns focus to that link. Native details/summary rows disclose further reading with plus/minus indicators.

### Living ASCII Sky

The fixed, non-interactive canvas covers the viewport. A twelve-character glyph atlas and precomputed branching fields create actual ASCII texture. The canvas renders at 1.5–2 times CSS resolution, using approximately 8×11px cells on desktop and 7×11px cells below 600px. Shimmer updates at roughly 30fps. A result-seeded bolt travels through the scene and fades over a four-second strike window. The scene is an interpretation of lightning, not a geographic rendering of an observation.

Animation pauses in hidden tabs. Reduced motion freezes the sky and suppresses the strike; CSS also removes transitions and smooth scrolling. Without WebGL, a static ASCII renderer provides the background. Save card produces a separate deterministic 1200×1500 PNG rather than a capture of the live canvas.

### Accessibility and Status

The decorative canvas is hidden from assistive technology. A visible-on-focus skip link leads to the generator. Interactive controls use a pale green focus outline (2px, 5px offset). The result is a polite, atomic live region; action feedback uses a status region. Preserve visible labels, tab semantics, native disclosures, and explicit loading/error states. Source text shows actual observation age, with an amber dot for older data; the displayed result retains its own snapshot provenance until reset.

## Do's and Don'ts

### Do:

- **Do** preserve the calm reading area inside the full-screen ASCII atmosphere.
- **Do** keep generation dominant and peripheral links quiet.
- **Do** adapt result typography to long numbers and multiline choices.
- **Do** preserve the static, flash-free reduced-motion experience.
- **Do** show actual source age and keep source metadata tied to the displayed result.

### Don't:

- **Don't** restore a homepage header, split illustration layout, or enclosing tool card.
- **Don't** replace rendered ASCII with a stock image or static decorative screenshot.
- **Don't** imply that the artistic bolt depicts an exact measured flash or that cached observations are a live stream.

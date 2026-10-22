---
name: Stormseed
description: A responsive random picker inside a living ASCII sky.
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
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "clamp(40px, 3.5vw, 76px)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.04em"
  result:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "clamp(128px, min(12vw, 19svh), 224px)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "clamp(14px, .95vw, 18px)"
    fontWeight: 400
  mono:
    fontFamily: "IBM Plex Mono, monospace"
    fontSize: "clamp(14px, .95vw, 18px)"
    fontWeight: 400
rounded:
  field: "4px"
  action: "4px"
  tab: "3px"
  tab-rail: "6px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#15251d"
    rounded: "{rounded.action}"
    padding: "0"
    width: "100%"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  input-number:
    textColor: "{colors.ink}"
    typography: "{typography.mono}"
    padding: "12px 0"
    width: "100%"
    height: "52px"
  button-quiet:
    textColor: "{colors.muted}"
    padding: "8px 12px"
---

# Design System: Stormseed

## Overview

**Creative North Star: "A living ASCII sky"**

A dark, atmospheric field of real rendered glyphs surrounds a clean, responsive instrument. The sky supplies the expression; restrained controls keep the decision easy. These rules capture the finished implementation in `public/index.html`, `public/style.css`, and `public/live-sky.js`, following the user-directed revisions in `.impeccable/review/contract.md`.

**Key Characteristics:**
- A full-screen, continuously shimmering ASCII scene.
- A centered tool with no homepage header or enclosing card.
- A bright branching bolt after each successful generation.
- Small peripheral links and progressively disclosed explanation.

## Colors

The palette pairs deep blue atmosphere with cool, readable type and a pale green action accent. Frontmatter values are normative; names below describe their application.

### Primary

- **Pale lightning green (`accent`)** marks the primary action, focus outline, and current-source dot. Its lighter hover variant belongs to the primary button.
- The canvas adds teal haze and luminous cyan-to-pale-green glyphs through shader lighting, with the center deliberately darkened for reading.

### Neutral

- **Deep night (`bg`)** anchors the page and the result's soft text shadow.
- **Cloud white (`ink`)** carries the headline, result, selected mode, and field values.
- **Cool mist (`muted`)** carries supporting copy and quiet actions; **distant blue (`dim`)** carries peripheral metadata.
- **Storm edge (`line`)** separates disclosed information and outlines secondary controls.

**The Readable Center Rule.** Keep the center of the sky subdued so the instrument remains legible without an enclosing panel.

## Typography

Space Grotesk serves the interface and large result. IBM Plex Mono distinguishes range values, tiny source metadata, and the ASCII glyph atlas. Both fonts are self-hosted and use `font-display: swap`. Space Grotesk is chosen for its open counters and distinctive angular numerals, including the large result; its popularity warning is intentionally accepted for this user-requested typographic replacement.

The headline scales from 40 to 76px on desktop and 28 to 42px on narrow screens. The result is the focal point: 128–224px, constrained by both viewport width and height. Four-to-six-character answers use a container-relative size; longer numbers use at most 15cqw / 76px; choices wrap at 28–44px. All variants preserve the complete result. The large numeral is functional output, so it intentionally exceeds the ordinary display-type ceiling.

Body text uses 16px with 1.6 line height. Primary controls use 16–20px, mode labels 14–18px, secondary actions 12–16px, and peripheral metadata 9–16px by role. Range fields use tabular monospace numerals. Mobile fields stay at least 16px to prevent input zoom. Only the ASCII renderer and actual data use monospace.

## Layout

The full-height stage uses a two-row grid: the centered instrument and an in-flow footer. The tool can grow to 860px; its picker scales from 360 to 600px using `clamp(360px, 29vw, 600px)`. This replaces the former fixed 340px picker. Page edges scale from 24 to 88px. No CSS transform or zoom scales text.

The viewport height constrains result size. At desktop heights below 850px, the result becomes 128px and gaps tighten while touch targets remain usable. The footer stays below the tool, so validation errors, long choices, larger text and short landscape screens extend the page instead of colliding with source details.

Below 700px the picker uses available width up to 420px, source metadata gets its own row, and brand/creator share the row below. Below 360px optional mode icons are hidden while all four labels and functions remain. Explanations become one column. At wide desktop sizes the title, result, controls and footer all have independent bounded scales; ultrawide screens preserve centered composition without stretching controls edge to edge.

## Elevation & Depth

Depth comes from the animated glyph field, haze, vignette, and central darkening. The instrument has no card background, border, or box shadow. A diffuse result text shadow (`0 3px 32px #06141c`) protects its silhouette. Supporting content uses thin rules and restrained translucent fields; keep structural surfaces quiet.

## Shapes

The primary action is a rectangular key with a 4px radius and a dark bolt cell at the right. Tabs share a 6px-radius rail; selected tabs have a clearly filled and outlined 3px-radius segment. Inputs and secondary controls use 4px radii. The explanatory close control remains circular. All icons are authored SVG in a consistent thin stroke.

## Components

### Buttons

The primary action spans the picker and grows from 58 to 76px high. The label fills the pale-green section; the bolt occupies a square dark cell. Both parts form one semantic button and one click target. Hover lightens the fill and tilts the bolt, press moves the key down 2px, disabled state reduces opacity. Copy, Save card and Share have visible icons, 44px targets and a quiet bordered hover treatment. Their reserved row prevents generation from shifting the tool.

### Inputs / Fields

Range fields each fill one half of the picker, with visible labels and right-aligned values above a rule. Native number inputs are 52px high and preserve full-width editing. The select uses a dark surface; the textarea starts at 96px and can resize to 240px. Errors are warm pale text in an alert region. Long results adapt to the picker width rather than overflowing.

### Navigation

Number, Coin, Dice and Choose form an equal-width segmented tablist with icons and labels. Selected state has both a fill and a visible border. Selection updates the matching panel and roving tab stop. Arrow keys and Home/End still work. How it works is a 44px outlined control at the upper right; it exposes expanded state and receives focus when the explanation closes. Native disclosure rows reveal additional details.

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

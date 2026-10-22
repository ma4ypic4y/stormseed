---
name: Stormseed
description: A chance print, seeded by real lightning.
colors:
  paper: "#171815"
  ink: "#f1f0e8"
  muted: "#a3a59b"
  red: "#f0785c"
  line: "#393b34"
typography:
  result:
    fontFamily: "Basteleur, serif"
    fontSize: "min(clamp(260px, min(33vw, 61svh), 720px), 68cqw)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.04em"
  result-three-digits:
    fontFamily: "Basteleur, serif"
    fontSize: "min(clamp(220px, min(26vw, 51svh), 570px), 44cqw)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.04em"
  brand:
    fontFamily: "Basteleur, serif"
    fontSize: "clamp(24px, 1.7vw, 36px)"
    lineHeight: 1.2
  headline:
    fontFamily: "Apfel, sans-serif"
    fontSize: "clamp(36px, 3.1vw, 64px)"
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Apfel, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Apfel, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  action:
    fontFamily: "Apfel, sans-serif"
    fontSize: "clamp(29px, 2.4vw, 44px)"
    fontWeight: 400
    letterSpacing: "-0.025em"
  metadata:
    fontFamily: "Apfel, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  disc: "50%"
spacing:
  small: "8px"
  medium: "16px"
  large: "24px"
  section: "32px"
  page-gutter: "clamp(24px, 4vw, 100px)"
components:
  button-generate:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.action}"
    padding: "0"
    width: "100%"
  action-disc:
    backgroundColor: "{colors.red}"
    textColor: "{colors.paper}"
    rounded: "{rounded.disc}"
    width: "64px"
    height: "64px"
  action-disc-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  button-result-action:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    padding: "0"
  mode-idle:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    padding: "0 0 0 17px"
  mode-selected:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    padding: "0 0 0 17px"
---

# Design System: Stormseed

## Overview

**Creative North Star: "A chance print"**

A chance print. The answer is the artwork: expressive Basteleur numerals or a spare outlined die on a flat, nearly black ground. Apfel brings a quiet, direct voice to the controls and explanation. Warm salmon marks the action and a brief discharge; it never becomes a background atmosphere.

This system uses scale, asymmetry, generous space and a few fine rules. It has no enclosing tool card, generated background or continuous rendering loop. The implemented reference is public/index.html, public/style.css and public/app.js; the generator composition belongs to its surface brief.

**Key Characteristics:**

- Nearly black ground, warm white type and restrained salmon.
- Self-hosted Basteleur Bold and Apfel Grotezk Regular.
- An oversized, fully contained answer with quiet controls.
- One brief, result-triggered motion sequence.

## Colors

A nearly black ground carries warm white type and one restrained salmon accent. The frontmatter preserves the source CSS values. The existing `paper` and `ink` token names denote ground and foreground; the browser uses the dark color scheme.

### Primary

- **Warm salmon** (`red`): the wordmark dot, action disc, selected-mode dot, focus outline, errors, older-data warning and transient discharge.

### Neutral

- **Night ground** (`paper`): the entire page and exported image ground; the nearly black arrow inside the action disc.
- **Warm white** (`ink`): results, headings, selected controls, fine primary-action rule and die outlines.
- **Sage grey** (`muted`): purpose copy, result captions, inactive modes and provenance.
- **Charcoal rule** (`line`): dividers and understated action underlines.

**The Single Accent Rule.** Use salmon for action, selected indicators, focus, errors, stale-data status and the brief discharge. Keep the reading ground neutral.

## Typography

Basteleur Bold gives the result and wordmark their distinctive shape; Apfel Grotezk Regular carries interface and reading text. Both fonts are self-hosted WOFF2 with `font-display: swap` and `font-synthesis: none`. Serif and sans-serif fallbacks preserve their roles.

The result uses tight tracking and a single line. Three-digit values have their own smaller scale. Both variants combine viewport dimensions with the result area's inline-size container; mobile and short-screen overrides keep the same container caps. Functional output deliberately exceeds ordinary headline sizes.

**The Contained Answer Rule.** The complete answer must fit its own column. Preserve the 68cqw cap for one or two digits and the 44cqw cap for three digits in every layout.

Apfel headings stay regular, tightly spaced and compact. Purpose copy scales from 17 to 23px; explanation text uses the body role with a maximum measure of 68ch. Result actions are 14px, while desktop metadata is 13px. Mobile purpose copy is 15px, headline 25px and caption 14px. Research prose uses 19px/1.65 and a 78ch measure, with Basteleur reserved for its main title.

## Layout

The stage fills at least the viewport height, grows naturally with content, and stops at 2400px. A three-row grid holds the masthead, instrument and in-flow colophon. Page gutters grow from 24 to 100px. Desktop gives the result and controls columns in a 1.5:1 ratio, with a bounded gap of 32–180px. The control panel stops at 420px; at 2000px and above it grows to 520px and supporting controls increase in size.

At 760px and below, the instrument becomes one column up to 480px: concise purpose first, result next, controls below. Controls stop at 340px. The colophon uses two columns with the hybrid-source note on a second row. Explanation content becomes one column and observation details become two.

At widths of at least 761px and heights no greater than 650px, the instrument uses a 1.2:1 split, a 260px result area, smaller type and tighter spacing. At all sizes the result retains its container cap. The result-action row reserves space before generation, preventing the controls from jumping when actions appear.

## Elevation & Depth

The system is entirely flat: no shadows, glow, haze, gradients or layered background imagery. Scale and negative space separate the answer from controls; fine rules separate actions and reading sections.

**The Flat Ground Rule.** Separate content through space, scale and fine rules; do not add elevation to the generator.

## Shapes

Use unboxed text controls and thin straight rules. The salmon action disc and the small selected-mode dot are circular. The die is a lightly rotated outline with rounded corners and circular pips, authored as SVG; its corner radius is 40 units in a 300-unit viewBox. Interface arrows and close marks use simple rounded strokes. Do not introduce a general rounded-card vocabulary.

## Components

### Generation and secondary actions

The primary button is an open horizontal line of type beneath a thin ink rule, with a circular arrow at the right. It is at least 94px high on desktop. The disc rotates 45 degrees and changes to ink on hover; pressing scales it to 90%. Disabled controls use half opacity and a wait cursor. Copy, Save card and Share are understated text buttons with subtle underlines and salmon hover feedback.

Controls generally reserve at least 44px in height; the compact mobile source and creator controls use 34px. Keyboard focus is a 2px salmon outline with 7px offset. Keep the visible-on-focus skip link, loading label, alert region and action status.

### Modes and navigation

The two mode buttons use `aria-pressed` in a labelled group. A salmon dot and ink label identify the selected mode; the inactive label is muted. There is no segmented rail. The wordmark and How it works control occupy opposite ends of the masthead. Its plus becomes a minus when the explanation is open; closing restores focus to the opener. Source age opens the observation details. Native disclosure rows keep their familiar markers.

### Result and discharge

The empty state is a question mark. Number mode displays a complete result from 1–100; dice mode displays the corresponding SVG pips. The polite live caption supplies the accessible result while the oversized visual is hidden from assistive technology.

A successful generation triggers one result reveal (500ms) and salmon SVG path trace (600ms); the discharge disappears within 650ms. It has no pointer interaction and does not continue animating. Reduced motion removes animations, transitions and the discharge, and uses immediate scrolling. This mark is an artistic response, not a measured lightning trajectory.

### Exported images

Save card draws a separate 1200×1500 PNG using the same ground, fonts, numeral or die, salmon mark and provenance footer. The site social image is 1200×630; `public/assets/social.provenance.json` records its code-rendered origin and font sources. It is the only shipped raster. Neither export is a generated background or a screenshot of the interface.

## Do's and Don'ts

### Do:

- **Do** make the answer the strongest visual element and keep every digit inside its result container.
- **Do** use the self-hosted typefaces and preserve the quiet, open control treatment.
- **Do** adapt wide, narrow and short screens with real layout changes.
- **Do** retain visible focus, live status, loading, error and reduced-motion states.
- **Do** tie source age and exported provenance to the displayed result.

### Don't:

- **Don't** restore the discarded dark ASCII atmosphere, generated wallpaper or continuous visual animation.
- **Don't** add cards, shadows, gradients or decorative fields around the generator.
- **Don't** size the result from viewport width alone or clip the three-digit answer.
- **Don't** present the salmon discharge as an observed lightning path or a recent snapshot as a live stream.

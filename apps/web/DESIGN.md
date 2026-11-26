---
name: Pulse
description: Self-hosted uptime monitoring, drawn as a catalog of signals on a matte black sleeve.
colors:
  ground: "#0c0c0c"
  ground-raised: "#141413"
  ink: "#ececea"
  ink-2: "#a8a8a4"
  ink-3: "#7f7f79"
  rule: "#2c2c2a"
  rule-2: "#474744"
  up: "#ececea"
  down: "#f04a2e"
  pending: "#f2b705"
  paused: "#6b6b67"
  signal: "#2f5bea"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 3.6vw, 4rem)"
    fontWeight: 500
    lineHeight: 0.95
    letterSpacing: "-0.02em"
    fontVariation: "\"wdth\" 125"
  display-catalog:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(3.5rem, 8vw, 6rem)"
    fontWeight: 500
    lineHeight: 0.95
    letterSpacing: "-0.02em"
    fontVariation: "\"wdth\" 125"
  title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.1rem, 2vw, 1.5rem)"
    fontWeight: 500
    letterSpacing: "0.18em"
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  body-md:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.375
  caption:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.22em"
  mono:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 400
    fontFeature: "\"tnum\" 1"
    fontVariation: "\"wdth\" 100"
  mono-value:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "13px"
    fontWeight: 400
    fontFeature: "\"tnum\" 1"
    fontVariation: "\"wdth\" 100"
rounded:
  none: "0"
spacing:
  tick: "2px"
  block: "3px"
  field-x: "12px"
  control-x: "16px"
  row: "16px"
  section: "40px"
  section-lg: "56px"
  rail: "248px"
components:
  button-primary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 44px 0 16px"
    height: "40px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "40px"
  button-danger:
    backgroundColor: "transparent"
    textColor: "{colors.down}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "40px"
  input-field:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    padding: "10px 12px"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 12px"
    height: "40px"
  nav-item-hover:
    backgroundColor: "{colors.ground-raised}"
    textColor: "{colors.ink}"
  nav-item-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    padding: "0 40px 0 12px"
  state-block:
    backgroundColor: "{colors.up}"
    rounded: "{rounded.none}"
    size: "8px"
  check-block:
    backgroundColor: "{colors.up}"
    rounded: "{rounded.none}"
    width: "7px"
    height: "12px"
---

# Design System: Pulse

## Overview

**Creative North Star: "The Pulsar Sleeve"**

Pulse is a catalog of signals printed on a Factory Records sleeve. Every monitor is a numbered entry (PLS 001, PLS 002) and its response times are drawn as white hairlines on matte black stock. The system is flat, ruled and square: 1px lines separate things, outlined controls invite action, and nothing is rounded, lifted or tinted. Surfaces are not boxed into cards; the page is a printed sheet divided by rules.

Colour is a code, not decoration. White means up, red means down, yellow means pending, grey means paused, blue means selection and "now". Colour appears as small solid blocks, as a hairline in a chart, as a catalog number set in red, and as the red end bar on the active control. Everything else is ink on black. This is an Operate-mode instrument: dense where it reports, quiet where it waits, and readable at a glance. The public status page is the same sleeve tuned for non-technical readers, with a larger verdict and one row of days per service.

The type does the identity work. Archivo at its expanded width (wdth 125) sets catalog numbers and verdict sentences; Archivo at normal width carries reading text; Martian Mono carries every measurement, timestamp, URL and code; wide tracked capitals label things that sit beside values. The rejected category default is the rounded zinc card dashboard with KPI tiles, green pills and sparklines.

**Key Characteristics:**
- Matte near-black ground, white hairline ink, zero radius everywhere.
- A five-colour state code (white, red, yellow, grey, blue), each colour owning exactly one meaning.
- Catalog numbering (PLS 000) as the identity device for every monitor.
- Expanded display type for numbers and verdicts; monospace for every measurement.
- Hand-built SVG instruments (stacked ridgeline, 24-hour dial, check blocks, day blocks) with HTML labels.
- Flat: depth comes from rules and occlusion, never from shadow.

## Colors

A black-and-white print palette with four signal colours held in reserve, each assigned one meaning.

### Primary
- **Sleeve Red** (down): the only loud colour. Down state blocks, failed check blocks, failed ticks on charts, the down monitor's ridgeline, the catalog number of a down monitor, error messages, the destructive control's text, the end bar on the primary control and active nav item, the 1px outline on the active index entry, and the text caret in fields. Its rarity is the point: on a healthy dashboard the only red is the action bar and the nav bar.

### Secondary
- **Signal Blue** (signal): selection and "now". Text selection highlight, the dial's current-time hand, and the "Selected" slot of the state strip. It is not used for links, buttons or branding.
- **Pending Yellow** (pending): a monitor that has not settled into up or down yet.
- **Paused Grey** (paused): a monitor the owner has paused, its ridgeline, and a disabled alert channel's dot. Blocks and lines only: as text it falls below 4.5:1, so the "Paused" label is set in Ash beside a grey block.

### Neutral
- **Matte Black** (ground): the page, field backgrounds, and the fill under ridgeline strokes that lets lower lines occlude higher ones.
- **Raised Black** (ground-raised): hover wash on list rows and nav items. The only tonal step above the ground.
- **Sleeve White** (ink): primary text, chart hairlines, the strong rule under section headings and table heads, the primary control's border, the focus outline, the active nav item's fill.
- **Up White** (up): same value as ink, named separately because it is a state. Passed check blocks, up state blocks, healthy days.
- **Ash** (ink-2): secondary text, help copy, inactive nav labels, table head labels.
- **Smoke** (ink-3): metadata, captions, axis labels, range labels, timestamps. On the ground it measures about 4.9:1, clearing 4.5:1 for small text; still keep it to supporting metadata.
- **Hairline** (rule): the default 1px divider between rows and sections; chart baselines and dial rings; no-data day blocks.
- **Hairline Strong** (rule-2): field and control borders at rest, empty check slots, the dial's outer ring and hub.

### Named Rules
**The Colour Is A Code Rule.** Each signal colour has one meaning and only that meaning. Red is down, yellow is pending, grey is paused, blue is selection or now. A colour never decorates, and no meaning borrows another's colour.

**The White Means Healthy Rule.** Passed checks, up states and healthy days are white, not green. Uptime percentages on an UP monitor are never coloured red, however low they read; a red number means the monitor is down.

**The Self-Decoding Code Rule.** Wherever colour carries state, a label or legend travels with it (state tags pair a block with a word, the state strip shows all five colours with the current one lit, day blocks carry a legend). Colour is never the only signal.

## Typography

**Display Font:** Archivo, expanded via the wdth axis to 125 (with ui-sans-serif, system-ui)
**Body Font:** Archivo at normal width (with ui-sans-serif, system-ui)
**Label/Mono Font:** Martian Mono with tabular figures (with ui-monospace)

**Character:** One grotesque family stretched wide for the sleeve's catalog numbers and verdicts and left at normal width for reading, plus a wide, technical monospace for everything measured. Both faces are self-hosted through next/font.

### Hierarchy
- **Display** (500, clamp 2.25rem to 4rem, 0.95): the dashboard verdict as a sentence ("One monitor is down."); the status page sets the same voice larger (clamp 2.5rem to 5.5rem). When something is down, a red square proportional to the type (0.5 to 0.55em) leads the sentence.
- **Display Catalog** (500, clamp 3.5rem to 6rem, 0.95): the catalog number heading a monitor's page, red when that monitor is down.
- **Title** (500, clamp 1.1rem to 1.5rem, 0.18em tracking, uppercase): the monitor name under its catalog number.
- **Body** (400, 15px, 1.5): reading text; explanatory paragraphs cap at 52 to 60ch, footnotes at 75ch.
- **Body Small** (400, 13px): row secondary lines, help text in forms, error messages.
- **Label** (500, 11px, 0.22em, uppercase): section headings that sit on a rule, table heads, nav items, state tags, form labels. Controls use the same voice at 0.2em.
- **Mono** (400, 11px, tabular): catalog numbers in lists, URLs, timestamps, axis and range labels. **Mono Value** (13px) for readings in tables and spec lists.

### Named Rules
**The Measured Things Are Mono Rule.** Every number that was measured or counted (response time, uptime, timestamp, status code, catalog number, URL) is Martian Mono with tabular figures. Prose and names are Archivo.

**The Eleven Pixel Floor Rule.** No text renders below 11px. Chart labels are HTML positioned beside or over the SVG, never SVG text that scales with the viewBox.

**The Caps Sit Beside Rule.** Tracked capitals label a value or open a ruled section; they never stack above a heading as a kicker.

## Layout

The dashboard shell is a fixed 248px left rail beside a fluid main column from 1024px up; below that the rail collapses into a top bar holding the mark and nav, and the monitor index is hidden. The main column pads 20px, 32px from 640px, and 48px from 1024px. The status page is a single centred column capped at 64rem.

On the dashboard, the verdict and the stacked ridgeline share a 4:8 split from 1280px; below that they stack. The catalog table uses its six-column grid (number, monitor, last 24 checks, average, uptime, checked) only from 1280px; below that each row is a two-column card-less layout with a state tag and the check readout spanning the width. The monitor page sets the dial beside a 380px spec column from 1280px. Forms are spec sheets: a 240px label-and-help column beside the control from 768px, each row opened by a rule.

Rhythm is ruled rather than boxed: list rows sit on 1px rules with 16px vertical padding, sections are separated by 40 to 56px, and instruments use tight 2 to 3px gaps between blocks so they read as one strip.

## Elevation & Depth

The system is flat. There are no shadows anywhere. Depth comes from three things: 1px rules (Hairline for ordinary division, Sleeve White under section and table heads for emphasis), a single hover wash (Raised Black), and occlusion inside the ridgeline, where each line's area is filled with the ground so lower monitors overlap the ones behind them like a stacked pulsar plot.

### Named Rules
**The Printed Sheet Rule.** Nothing floats. Separate with a rule, emphasise with a heavier rule, respond to hover with the raised wash. No shadow, blur, gradient or glow.

## Shapes

Zero radius on everything: controls, fields, checkboxes, state blocks, check blocks, day blocks, the logo's frame. Borders are 1px. Solid rectangles are the only filled shapes: state blocks (8 to 10px squares), check blocks (7 by 12px), day blocks (flex-width, 32px tall), legend swatches (20 by 8px), state strip segments (28 by 10px). Icons are inline SVG at 1.5px stroke with square caps; the logo mark is a heartbeat line with mitred joins inside an outlined square. The ridgeline's collapsed gaps are drawn as a pair of slanted hairlines (a double slash).

## Components

### Buttons
Outlined square controls in the catalog's label voice; the primary carries a red end bar, like the active button on the sleeve.
- **Shape:** square corners (0), 1px border, 40px minimum height.
- **Primary:** transparent with a Sleeve White border and label; a solid Sleeve Red bar 28px wide fills the right end, bleeding over the border. Used once per view for the main action (Add monitor, Save).
- **Hover / Focus:** the primary's red bar widens to 34px (160ms, cubic-bezier(0.16, 1, 0.3, 1)); other controls brighten their border from Hairline Strong to Sleeve White (120ms ease-out). Focus is a 1px Sleeve White outline offset 3px.
- **Secondary:** Hairline Strong border, Sleeve White label (Cancel, Edit, Pause).
- **Danger:** Sleeve Red label, border turns red on hover (Delete, Remove).
- **Compact:** 32px tall with 12px padding and the same 11px label, for per-row actions in lists.
- **Disabled / pending:** 45% opacity, not-allowed cursor, label swaps to a present-participle ("Saving", "Pausing").

### Chips
No pills. State is shown by the **State Tag**: an 8px solid state block followed by the state word in tracked capitals, the word coloured in its state colour except for up, which stays ink.

### Cards / Containers
There are no cards. Groups are sections opened by a label on a Sleeve White rule; items are rows on Hairline rules. Hover on a linked row applies the Raised Black wash.

### Inputs / Fields
- **Style:** full width, 1px Hairline Strong border, Matte Black fill, 10px by 12px padding, 14px text, Smoke placeholder; technical inputs (URL, numbers) are set in mono. The caret is Sleeve Red.
- **Hover / Focus:** border to Smoke on hover, to Sleeve White on focus; no glow.
- **Error:** a 13px Sleeve Red message beneath the control, linked by aria-describedby.
- **Select:** native chevron replaced by a square-capped 12px chevron in Ash, 12px from the right.
- **Checkbox:** 16px square, 1px Smoke border, fills with an 8px solid white square when checked (scale-in, 120ms).

### Navigation
Rail nav items are 40px tall tracked capitals in Ash. Hover applies the Raised Black wash and Sleeve White text. The active item inverts to a Sleeve White fill with Matte Black text and carries a 6px Sleeve Red end bar on its right edge. Below the nav, the **Monitor Index** lists every monitor as a state block, mono catalog number and name; the active entry is outlined by a 1px Sleeve Red border. On narrow screens the nav runs horizontally in the top bar and the index is hidden.

### Signal Readout
The last 24 checks as a strip of 7 by 12px blocks with 3px gaps, oldest left: white for passed, red for failed, a 1px Hairline Strong outline for a slot with no check yet (grey stays reserved for paused).

### Stacked Ridgeline
The dashboard's signature instrument: one hairline per monitor (1.3px, non-scaling), stacked top to bottom, each scaled to its own range, which is printed in mono at the right. Lines are white, red for a down monitor, grey for a paused one. Where no check ran the line breaks instead of drawing flat; stretches empty for every monitor collapse into a labelled double-slash break ("1h 12m gap"), and leading emptiness before the first check is dropped. Failed checks are 3px red ticks under each baseline; baselines are dotted Hairline. Catalog numbers and labels are HTML at 11px.

### 24-Hour Dial
The monitor page's signature: a radial plot where angle is time of day and distance from the centre is response time. White hairline trace, Hairline rings and hour spokes, red ticks for failed checks, a 2px Signal Blue hand for now, hour and ring labels in HTML mono at 11px.

### Uptime Days
On the status page, 90 day blocks (45 on mobile) 32px tall with 2px gaps. A day with checks is white; failed checks fill a red share from the bottom sized to the failure rate, never less than 18% so a single failure stays visible. Days without data are Hairline. A code legend sits beside the section heading.

### State Strip
All five code colours in a row of 28 by 10px segments, the current state at full strength and the others at 18%, under a monitor's catalog number so the code decodes itself.

## Do's and Don'ts

### Do:
- **Do** keep every corner square (0) and every border 1px.
- **Do** give each state colour exactly one meaning: Sleeve Red down, Pending Yellow pending, Paused Grey paused, Signal Blue selection and now.
- **Do** draw passed checks, up states and healthy days in white.
- **Do** pair every colour signal with a word or legend.
- **Do** set every measurement, timestamp, URL and catalog number in Martian Mono with tabular figures.
- **Do** number monitors as catalog entries (PLS 001) and use the number as their identity in lists, charts and headings.
- **Do** mark the primary action with the red end bar, and only one per view.
- **Do** label charts with HTML at 11px or larger, positioned beside the SVG.
- **Do** break chart lines where there is no data and collapse long empty stretches into a labelled double slash.
- **Do** state the verdict as a sentence in expanded display type.

### Don't:
- **Don't** round anything, add shadows, gradients or glows.
- **Don't** use green for healthy, or colour an UP monitor's uptime number red.
- **Don't** use yellow for warnings that are not the pending state, or grey for anything but paused.
- **Don't** box content into cards or KPI tiles; divide with rules.
- **Don't** set text below 11px or use scaled SVG text for labels.
- **Don't** put tracked capitals above a heading as a kicker.
- **Don't** use the six-column catalog table below 1280px.
- **Don't** draw a flat line across a period with no checks.

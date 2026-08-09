# Mobile visual translation specification

> **Superseded for implementation (2026-08-09):** The universal figure-component contract, inspector, per-figure actions, chips, sliders, filters, mini-networks, and mobile Three.js guidance below are retained as historical audit evidence. Current mobile implementation authority is [`docs/design/mobile-editorial-edition.md`](../design/mobile-editorial-edition.md). Its static editorial grammar overrides conflicting interaction requirements; evidence provenance, source separation, visible absence, and claim limits remain in force.

**Audit date:** 2026-08-08

**Implementation order:** complete the pattern on `/words/forever`, then generalize only proven primitives

**Status:** transformation specification written before implementation; no item is marked as browser-verified here

## Purpose and evidence boundary

The desktop posters remain the large-format expression of the research. Mobile is a different editorial composition, not a proportional shrink and not a lower-information refusal screen.

Every mobile figure must reveal its primary research meaning without hover, drag, swipe, WebGL, or an open inspector. Interaction may select, compare, or reveal source detail. It may not be the only route to the claim, caveat, or evidence boundary.

This specification is based on source inspection. Exact overflow, touch, keyboard, screen-reader, console, and performance results require the viewport QA runs listed at the end. No result is inferred or fabricated.

## Universal figure contract

Each translated figure has the following visible order:

1. stable section anchor;
2. figure number and title;
3. one- or two-sentence plain-language summary;
4. source and coverage register;
5. visible caveat/claim boundary;
6. a legible default visual or ranked textual state;
7. visible interpretation;
8. explicit evidence action;
9. optional data table;
10. copy-link/share action;
11. accessible `figcaption`.

Recommended semantic structure:

```html
<section id="stable-anchor" aria-labelledby="figure-title">
  <figure aria-describedby="figure-summary figure-caveat">
    <header>…title, summary, source, coverage, caveat…</header>
    <svg role="img" aria-labelledby="svg-title svg-desc">…</svg>
    <p>Visible interpretation…</p>
    <details>…accessible data table…</details>
    <div>…inspect, copy link, share…</div>
    <figcaption>…what is encoded and what is not…</figcaption>
  </figure>
</section>
```

The SVG `title`/`desc` should describe the selected state, not every point. The table carries exact values. Colour is reinforced by labels, line styles, symbols, or ordering.

### Shared component responsibilities

| Component | Responsibility | Must remain available without interaction |
| --- | --- | --- |
| `MobileFigureFrame` | Figure semantics, title, summary, source, coverage, caveat, caption, anchor | Entire frame and interpretation |
| `FigureSummary` | Source-bounded reading and explicit non-claim | Yes |
| `FigureDataTable` | Exact current-filter rows with caption and scoped headers | Yes, behind a normal disclosure if large |
| `FigureShareActions` | Copy canonical section/figure link; optional Web Share | Copy-link button and status |
| `MobileInspectorSheet` | Evidence/source detail for a selected mark | No primary meaning lives only here |
| `MobileFrequencyStory` | One selected frequency series, variant controls, SVG, stats, interpretation, table | Default series and summary |

### Responsive selection

- Use the vertical reader whenever the figure container is below approximately 60rem; this includes 768×1024 portrait tablets.
- Preserve the current full poster figure at a suitable desktop container width, normally 64rem and above.
- Do not ship two heavy active client trees and hide one with CSS. The static/ranked reading is server-visible; the optional desktop/3D enhancement is loaded near the viewport and only where it is usable.
- A data table may use local horizontal scrolling. The page, figure, caption, controls, and inspector may not establish body-level overflow.

## Interaction and accessibility grammar

### Selection

- Tap/click or Enter/Space selects and pins a series, mark, category, or evidence card.
- A second tap may open evidence detail only if the first tap's selected state is visible; an explicit “Inspect evidence” button is preferred.
- Hover may preview the same selected state on desktop, but all labels and values needed for interpretation remain present on touch and keyboard.
- Chip and button hit areas are approximately 44 × 44 CSS px or larger. SVG marks receive larger transparent hit targets when necessary.

### Inspector sheet

- Use a labelled modal dialog or equivalent accessible implementation.
- Move focus to the sheet heading or close button; trap focus; close on Escape, explicit close, or permitted backdrop action; restore focus to the triggering control.
- Respect the bottom safe area and use internal scrolling above a maximum height.
- Do not position the sheet from mouse coordinates on mobile.

### Motion

For `prefers-reduced-motion: reduce`:

- stop interval-based rotation and `requestAnimationFrame` auto-motion;
- remove infinite SVG/CSS animation and smooth scrolling;
- render the final line/path state immediately;
- retain tap and keyboard selection without animated travel;
- do not replace content with a “motion disabled” message.

### Copy and share

- “Copy figure link” uses `https://www.wordsovertime.com/<canonical-path>#<stable-anchor>`.
- Announce success or failure in a polite `aria-live` region and keep a non-Clipboard API fallback.
- Web Share is optional and uses the same canonical URL. It is not a third-party share script.
- Citation text distinguishes the project citation from a DOI citation. A DOI is used only where its modelling is factually correct for that page/figure.

## P0: Forever mobile frequency story

### Current behavior to replace

Below the Tailwind `sm` breakpoint, `FrequencyTimeline` displays “This visualization requires a wider screen” and asks readers to rotate or use desktop. At larger widths the SVG has a 1320px minimum width. The desktop graph uses a square-root vertical display scale and explicitly notes “frequency, not first attestation.”

### Required mobile composition

1. **Title:** “Written frequency of forever and its variants.”
2. **Summary:** explain, using reviewed project copy, that the chart compares the existing Google Books Ngram series; do not turn frequency into a definition or origin claim.
3. **Variant controls:** `forever`, `for ever`, `forevermore`, and `forever and ever`, sourced from the dataset labels. One series is visible at a time. Use wrapping chips or a two-column segmented group, never a one-line body-wide strip.
4. **Default:** select the dataset's primary `forever` series. If the content model later supplies an explicit default, use that field rather than positional array order.
5. **Chart:** purpose-built responsive SVG sized from its actual container, with no fixed minimum width. Use three to five year labels, one y-scale cue, a direct end label, and no legend needed to identify the single line.
6. **Coverage register:** show the source coverage, the selected public display start, the first visible plotted year, and the final plotted year as separate concepts.
7. **Summary values:** show the most recent exact value and, only when defensible, the highest annual plotted year/value in the selected public range. Label an unsmoothed maximum “highest plotted year,” not a causal or semantic “peak.”
8. **Scale:** state “frequency per million; square-root display scale” if the mobile chart retains the desktop transform. If it uses a linear scale, say so and verify legibility; never leave the scale implicit.
9. **Caveat:** visibly state that Ngram frequency is not first attestation, that early print/OCR signal has limitations, and that the selected series' `coverageNote` controls the wording.
10. **Interpretation:** one reviewed sentence tied to the selected series. It cannot be generated from the line shape alone.
11. **Inspect:** tapping a line/mark or an explicit button opens the existing inspector entry for that series.
12. **Table:** year and frequency-per-million rows for the selected series/current era, with an accessible caption. A compact mode may show sampled years plus first/highest/recent values, but the full exact current-filter table must remain available.

### Derivation rules

- Filter from the existing `GeneratedFrequencySeries.points`; do not edit or smooth the research values.
- The public display start is `recommendedVisualStartYear` when present, otherwise `startYear`.
- “First visible data year” is the first finite point after the active era and public-start filters. It is not `firstNonZeroYear` and is never labelled attestation.
- “Recent value” is the last finite point in that filtered series.
- “Highest plotted year/value” is the maximum `frequencyPerMillion` within the same filtered points. If ties occur, state the range or choose a documented deterministic rule. Do not use early audit-only points outside the recommended public range.
- Preserve `smoothing: 0` in the source register for the current data. If smoothing changes later, the UI must report the actual dataset value.
- Era filters can narrow the visible range but cannot rewrite the source coverage.
- Numeric formatting must be deterministic and preserve meaningful small values; the table retains enough precision to reconstruct the plotted point.

### Optional scrubber

A native range control may pin a year after the basic chart is usable. It has a visible label, current-year/value output, keyboard arrow support, and does not prevent direct table access. Dragging is an enhancement, not a release gate for the primary meaning.

### Desktop preservation

At the desktop breakpoint, preserve the multi-series frequency field and current research data. The mobile story does not replace or reduce the desktop chart. Both states must use the same source slice and scale labelling.

### P0 acceptance

- no orientation or wider-screen refusal;
- usable at 320px with no body overflow;
- selected series and value are understandable without hover;
- all four variants are reachable by touch and keyboard;
- SVG has `role="img"`, a selected-state title/description, and a visible caption;
- source, coverage, display scale, and “not first attestation” caveat are visible;
- table values match the unchanged source points;
- desktop chart remains available and unchanged in meaning.

## P1: Forever complete vertical reader

### 01B–01C: pressure bloom and recurrence structure

**Current form:** two responsive but dense poster SVGs with continuous SVG animation. At narrow width their embedded labels shrink; there is no local reduced-motion treatment.

**Mobile primary state:** a vertical six-step historical sequence using the same pressure anchors and periods already present in the Forever study. Each step shows label, period, evidence layer, visible value/role, and caveat. Connections are explicitly labelled interpretive influence routes, not causal proof.

**Optional secondary state:** a compact static bloom/orbit overview after the sequence. Tapping a step highlights its counterpart. The overview is decorative/contextual unless every mark is keyboard-selectable.

**Acceptance:** sequence remains meaningful with the SVG removed; animation is absent under reduced motion; no label is hidden inside an unreadably scaled viewBox.

### 02: permanence under suspicion / 3D instrument

**Current form:** an immediately initialized Three.js globe with continuous rotation, drag, and hover. Four evidence cards below it remain readable when WebGL fails.

**Mobile primary state:** move the reviewed question, non-conclusion, and four evidence cards before any 3D enhancement. Add a static 2D preview generated from the same card/state mapping. Each card exposes the evidence label, source, doubt/caveat, and an inspect action.

**Optional enhancement:** “Explore the evidence instrument” or a near-viewport enhancement after the static state. It must not auto-load Three.js in an unrelated initial mobile bundle. Tap selects; drag rotates only after explicit engagement. Reduced motion disables auto-rotation.

**Acceptance:** disabling JavaScript/WebGL leaves the complete primary reading; the canvas is not the sole labelled control; focus can enter and leave the optional viewer; evidence detail never depends on hover.

### 03: relational constellation

**Current form:** 1540px minimum-width radial SVG, locally horizontally scrollable, with mouse-led mark inspection.

**Mobile primary state:** ranked phrase and collocate lists before the mini-network.

- Keep archival and 2024–2026 modern snapshot evidence visibly separated.
- For archival phrases/collocates, retain the current eligibility and ordering logic: display-eligible records, sorted by count and then score value, with the existing limits documented.
- Show phrase/token, period/layer, count, document frequency where present, semantic category, and evidence action.
- State that counts from unlike corpora are not directly comparable.

**Optional secondary state:** a small labelled network for the currently selected phrase/category. It cannot be the only representation of relationships.

**Acceptance:** top relationships and corpus boundary are readable without pan; every list row is keyboard-selectable; the mini-network uses direct labels and is not required for navigation.

### 03B: historical signal semicircle

**Current form:** a fixed-height semicircle with hover-only active detail and CSS drawing/pulse animation.

**Mobile primary state:** a chronological list of the existing historical bands with dates, evidence cue, and separately labelled frequency/public-search encodings. The list must retain the current caution that the two quantities are a designed signal representation, not one comparable measurement.

**Optional secondary state:** compact static semicircle with the selected band labelled directly.

**Acceptance:** no detail is hover-only; reduced motion displays final strokes without draw/pulse animation; labels do not rotate into unreadable mobile text.

### 04: context signal field

**Current form:** 1400px minimum-width draggable semantic globe with interval auto-rotation and pointer/mouse inspection.

**Mobile primary state:** six vertically comparable semantic-category strips. Each strip shows category, archival support, modern snapshot support, evidence strength/confidence, period, and a link to supporting evidence. Preserve an explicit gap where corpus layers are not comparable.

**Optional secondary state:** compact static globe keyed to the selected strip. Do not run interval rotation under reduced motion or before the figure approaches the viewport.

**Acceptance:** all six categories can be compared by reading down the page; rotation is unnecessary; numbers and colour are accompanied by text; archival and modern values are not visually merged into a continuous series.

### 05: evidence archive

**Current form:** 1420px minimum-width atlas with mouse-led marks across lexical prehistory, Ngram, Gutenberg, a 1930–2023 gap, and the Wikinews snapshot.

**Mobile primary state:** filters plus evidence cards.

- Filters: layer, era, category, and evidence type; a clear/reset action is always available.
- Each card: title/form/phrase, date or period, source corpus, evidence type, visible excerpt only when rights permit, confidence/status, rights status, caveat, and inspect/source action.
- Keep lexical attestation, frequency, archival context, the non-comparable gap, and modern snapshot visibly distinct.
- Never expose ignored/restricted raw cache paths or a quote whose rights record does not permit publication.

**Inspector:** source bottom sheet with full existing inspector fields, Escape/close/focus restore, and safe-area spacing. The card retains the essential meaning when the sheet is closed.

**Acceptance:** the archive is usable without a 1420px pan; filters are labelled and keyboard-operable; the evidence gap remains visible; source links and rights/caveats are readable; no source detail relies on mouse coordinates.

## Route-by-route transformation catalogue

The following specifications are intentionally route-specific. Except for the Forever P0/P1 work above, they are future implementation requirements, not claims of completed mobile views.

### Artificial

| Desktop visual | Mobile primary state | Optional enhancement |
| --- | --- | --- |
| Semantic chamber (Three.js/spatial planes) | Three stacked semantic-plane sections with the existing terms, boundaries, and evidence notes; state explicitly that distance is the project's visual mapping. | Static isometric overview, then opt-in/near-viewport 3D. |
| Under Pressure (wide SVG) | Vertical pressure sequence with each current reading, input evidence, and caveat visible. | Compact selected-state diagram. |
| Mechanical reproduction suite | Chronological cards/selected layer line for apparatus, reproduced experience, and authenticity pressure using the existing data. | Small timeline scrubber and desktop suite. |
| Suspicion orbit | Ranked historical contexts with period and evidence support. | Compact selected orbit. |
| Semantic attractor (3D/spatial distance) | Ordered relation table: made, synthetic, simulated, realistic, and fake-adjacent, preserving distinctions and the current mapping caveat. | Static 2D field, then optional 3D. |
| Human boundary (3D stack) | Vertical stages from external apparatus through the existing support/replacement/process categories. | Static stack, then optional 3D. |

Do not turn “artificial” into an AI-only page. The first visible answer must preserve the existing before-fake/before-AI evidence boundary.

### Privacy

| Desktop visual | Mobile primary state | Optional enhancement |
| --- | --- | --- |
| Semantic weather | Period-by-period track strips with exact current track scores and source caveat. | Compact weather field. |
| Legal injury | Vertical chronology of the existing legal branches/nodes plus one selected phrase line. | Small matrix. |
| Modern transit | Vertical route/station sequence from legal right to data-system terms. | Compact transit map. |
| Geographic attention map | Ranked country/region summaries first, with recovered-signal method and geographic bias visible. | Map second. |
| Elevation distribution | Ranked bands/records and a non-causal summary. | Small selected scatter/strip. |
| Demographic context | Comparable record table and visible population/life-expectancy caveat. | Small selected network/scatter. |
| Governance interface | Vertical actor/flow sequence with source and limitation at each stage. | Compact interface map. |

The canonical page must distinguish word-history intent from a site privacy policy in its first screen. Geographic, elevation, and demographic correlations must not be phrased as causes. The uncommitted privacy mobile demo is outside this specification's implementation evidence.

### Hub

| Desktop visual | Mobile primary state | Optional enhancement |
| --- | --- | --- |
| Five-layer semantic/frequency field (Three.js) | Selected layer plus ranked terms, dates, support values, and current caution. | Static field, then optional 3D. |
| Transfer model | Vertical `transport/logistics input → hub-and-spoke model → communication/network extension` stages, using the existing routing terms. | Compact flow diagram. |
| Naming machine (radial/3D) | Ranked `X + hub` families with evidence/support labels. | Mini radial and optional 3D density cloud. |
| Minor-hub branch cards | Single-column editorial cards with persistent labels and source notes. | Existing multi-column poster at wide widths. |
| Centrality/dependency field | Dependency tier list and modifier rankings first. | Small labelled network/semicircle. |

The mobile order must keep wheel-centre evidence, transport-node transfer, and network/naming extensions distinct; “hub means network centre” is not an adequate replacement for the research sequence.

### Data

| Desktop visual | Mobile primary state | Optional enhancement |
| --- | --- | --- |
| Historical index | One selected historical panel/timeline at a time, with terms and evidence register below. | Compact dual-panel overview. |
| Socialized generation (1340px layout) | Vertical platform-era step sequence and selected term relationships. | Mini ring/core overview. |
| Datum route | Vertical grammatical route from singular item through the attested usage changes, with counts/source caveats. | Compact route diagram. |
| Cross-pressures (1440px SVG) | Four vertical pressure strips: personal attachment, institutional control, scientific evidence, and ethical responsibility, using the existing node data. | Compact cross-field. |

Do not describe grammatical change as universal or complete when the source only supports a corpus-specific tendency. Preserve “datum/data” evidence and governance/AI-era interpretation as separate layers.

### Depression

| Desktop visual | Mobile primary state | Optional enhancement |
| --- | --- | --- |
| Historical semantic plate (1080px minimum SVG) | Selected semantic branch on a vertical chronology with attestation, frequency, evidence type, and branch caveat. | Compact plate overview. |
| Semantic machine | Ranked systems/gears and explicit relation groups; state that size is semantic weight in the editorial mapping, not importance. | Static machine diagram with selected gear. |
| Social atmosphere loop | Vertically comparable domain/category strips with bridge evidence. | Compact loop. |
| Living method map | Ordered method/evidence rows. | Compact route map. |
| Semantic translation field (1180px minimum) | System-by-system cards showing what is preserved, compressed, intensified, or lost. | Small selected matrix. |

The current bottom annotation strip becomes the shared inspector-sheet pattern on mobile. It must not cover content, must close with Escape, and must restore focus. Reduced-motion work already present in several Depression visuals should be preserved and extended rather than replaced.

## Static preview and image rules

Where a figure has sharing/citation value, generate an SVG or PNG preview from the same reviewed data and mapping:

- standard `img` or Next Image, never a CSS-background-only primary image;
- explicit width and height to prevent layout shift;
- descriptive filename, alt text, caption, and canonical section link;
- responsive `srcset`/`sizes` where a raster preview is used;
- alt text states the figure's conclusion and boundary, not every decorative mark;
- data changes invalidate/regenerate the preview through a documented script;
- the preview does not contain restricted evidence or imply redistribution rights.

Image sitemap inclusion is appropriate only after the preview is public, canonical, and rights-cleared.

## Performance architecture

- The figure title, summary, caveat, static/default state, and caption are server-visible.
- Split data by figure and selected route; do not send the full Forever dataset to unrelated islands.
- Lazy-load optional interaction near the viewport with a useful static fallback.
- Do not use `ssr: false` for primary research content.
- Three.js should not initialize on narrow mobile when a static/ranked state is the intended presentation.
- Avoid duplicate JSON in the mobile and desktop trees. Derive both presentations from one route-specific server slice.
- Preserve exact repository data and reproducibility; payload reduction happens at the server/client boundary, not by deleting research records.

Performance targets from the project brief remain targets until measured: word-page mobile lab LCP at or below 3.0s, TBT proxy without regression, CLS at or below 0.1, no hydration errors, and a meaningful measured reduction in Forever initial client JavaScript or serialized data. This specification records no fabricated pass.

## Verification matrix

Test Forever first at 320×568, 360×800, 390×844, 430×932, 768×1024, and 1440×900. Repeat the universal checks when each other route is translated.

### Visual and overflow

- `document.documentElement.scrollWidth === document.documentElement.clientWidth` after load, after every selection, and with an inspector open;
- no clipped title, summary, source, caveat, caption, or fixed control at 200% text zoom;
- local table scrolling does not move the body;
- desktop figure remains visually and semantically equivalent at 1440px;
- screenshots capture default, selected, table-open, inspector-open, and reduced-motion states.

### Input and assistive technology

- complete keyboard path through variant chips, chart marks/actions, table disclosure, copy/share, and inspector;
- visible focus throughout;
- screen-reader announcement for selected series/year/value and copy status;
- touch targets approximately 44px;
- no mouse-coordinate-only inspector positioning;
- no hover-only label or source;
- Escape closes the inspector and focus returns to the trigger.

### Data and claims

- plotted points and table rows match the unchanged source JSON;
- selected era affects only the intended series/rows;
- source, coverage, smoothing, display scale, and caveat are accurate;
- frequency is never labelled first attestation;
- non-comparable archival and modern layers stay distinct;
- excerpts obey rights status;
- hash links survive hydration and state changes.

### Motion and runtime

- reduced-motion disables auto-rotation, infinite loops, draw-on animations, and smooth scroll while preserving the final state;
- no console error, hydration warning, or focus error;
- optional Three.js is absent from unrelated/narrow initial work where the static state is used;
- request count, transferred bytes, initial JS, RSC/Flight payload, and long tasks are recorded rather than estimated.

## Delivery status vocabulary

Use these labels in the implementation report:

- **Implemented and verified:** code exists and all named viewport/input/data checks have evidence.
- **Implemented, verification pending:** code exists, but one or more named checks lack evidence.
- **Specified, not implemented:** this document defines the transformation but the desktop/current behavior remains.
- **Blocked with evidence:** a named dependency or evidence gap prevents safe implementation.

At the time this pre-implementation specification was written, Forever's mobile frequency replacement and the other translations were **specified, not browser-verified**. The final audit must update status from actual changed files, commands, screenshots, and measurements rather than from this plan.

# Artificial mobile — implementation and visual evidence

Date: 2026-08-15  
Route: `http://localhost:3000/words/artificial`  
Status: `READY_FOR_USER_VISUAL_ACCEPTANCE=false`

This evidence pack records the four-page mobile implementation requested from the five supplied references. It does not claim design acceptance on the user's behalf.

## Outer publication frame addendum

The current mobile route now carries the same neutral publication-frame responsibilities as Mobile Privacy without importing Privacy components, CSS, colour, cards, figures, or interaction rules:

- local `WORDS OVER TIME` and `ABOUT` navigation with two 44 px touch targets;
- a `WORD STUDY` marker and visible mobile `artificial` title;
- one full-viewport `CLOSE FINDING` movement after the four Artificial data pages;
- a folded `SOURCES / RIGHTS` disclosure;
- a real `BACK TO TOP` anchor and semantic page footer.

The frame keeps only those publication responsibilities. Following the 2026-08-15 visual correction, it no longer borrows Privacy's paper surface: navigation, study opening, all four data movements, close finding, sources, back-to-top, and footer now share one continuous Artificial black grid. Artificial red remains the route accent; primary text is white and secondary text is grey.

Fresh browser measurements:

- 390 × 844: 20 px gutter, 44 px navigation targets, 350 px subject field, 852 px close-finding field, 56 px back-to-top target, and zero horizontal overflow;
- 430 × 932: 20 px gutter, 44 px navigation targets, 356 px subject field, 932 px close-finding field, 56 px back-to-top target, and zero horizontal overflow;
- 240 px minimum browser override: 16 px frame gutter, non-colliding navigation, single-line `artificial`, naturally expanding close section, 56 px back-to-top target, and zero horizontal overflow;
- the sources disclosure expanded at 390 px and 240 px without changing the document width;
- activating `BACK TO TOP` produced `location.hash=#m-artificial-top` and `scrollY=0`;
- at 1440 × 900 the mobile wrapper computed to `display:none` with a zero-size rect, while the desktop Artificial edition remained visible.

The browser initially exposed an existing server/client SVG floating-point serialization mismatch. All projected tree and sphere coordinates are now serialized to four decimals, eliminating the hydration issue without changing record counts, radii, or layout.

## Interaction, Safari, and public-language addendum

The current interaction pass preserves the two visualizations as single-axis views: `y` never rotates, yaw remains limited to `−48°…+48°`, and no camera or all-direction scene was introduced.

- The gesture starts in a neutral state. It becomes rotation only after horizontal movement exceeds the vertical movement by more than `7 px`; vertical and ambiguous gestures remain page scroll.
- The field keeps `touch-action: pan-y pinch-zoom`, plus a `pan-y` fallback, so one-finger vertical scroll and two-finger page zoom remain native.
- `pointercancel` and unexpected lost capture cancel the pending frame, restore the yaw from the start of the gesture, clear capture state, and never announce or replay. This prevents iOS scrolling, pinch, or system gestures from committing a partial turn.
- Touches within `24 px` of the visual viewport edge do not start rotation, preserving Safari's edge-navigation gesture.
- Long-press selection and touch callout are disabled only inside the rotatable plot; the document remains normally selectable and scrollable.
- A true tap of at most `6 px` and `450 ms`, or `Enter`/`Space`, remounts only the selected SVG drawing and replays its deterministic point-and-line draw. Rotation, cancel, and page scroll never trigger replay.
- Scroll entry is driven by `IntersectionObserver`, not a continuous scroll timeline. SSR/no-JS output is complete, observed scenes animate once, and reduced-motion or unavailable-observer environments immediately show final geometry.
- During active rotation, per-point blur/drop-shadow is temporarily removed to reduce Safari repaint cost; data coordinates, counts, and relationships do not change.

Browser interaction checks at `390 × 844`:

- tapping the phrase tree changed `data-redraw-count` from `0` to `1` while retaining `60` SVG circles (`30` core circles plus their attached halos);
- one keyboard step moved a sampled projected x-coordinate from `63.8564` to `58.4960`; `Home` returned it exactly to `63.8564`;
- dot-matrix mode changed from all `30` selected phrases to `6` body phrases while preserving the `30`-phrase denominator;
- scrolling through the document advanced all five observed movements from `pending` to `visible`;
- computed plot interaction styles were `touch-action: pan-y pinch-zoom` and `user-select: none`;
- document width and body scroll width both remained `390 px`.

At the `240 px` narrow/zoom proxy, document and body width both remained `240 px`; the rotatable field was `216 px`, its three controls occupied `132 px`, the dot matrix reflowed to three `70.66 px` columns, and every closing-branch button retained a `44 px` height. The closing movement expanded naturally to `907 px` rather than clipping its interactive answer.

Every public string, including hidden headings, tooltips, live regions, and chart labels, was scanned for internal pipeline language. The rendered route no longer contains `production-eligible`, `mobile-owned frozen`, `adjudicated`, `source-bound`, `ordinal charge`, `registry record`, `selected record`, `310 LOG`, `deterministic`, or `layout aids`. Public object names are now specific: phrase, media term, source statement, dated example, or human-function example. The generated research artifact still contains internal release/blocker fields, but the production adapter continues to exclude them.

## Reference mapping

| Mobile movement | Reference reconstruction | Production-safe data |
| --- | --- | --- |
| Page 1 | Terminal-pair left screen + continuous source-support readout | 30 exact artificial-prefix phrases, 12 selected media terms, 11 source statements |
| Page 2 | Terminal-pair right upper screen + paired linear plots | 7 dated distrust examples; 25 human-function examples aggregated as 5 / 5 / 4 / 11 |
| Page 3 | Terminal-pair right 3D evidence field + continuous three-row metric band | 25 equal human-function examples; study summaries 30 / 12 / 25 |
| Page 4 | Inverted black 6 × 6 dot matrix with top-right multi-state switch | 30 equal phrase marks; ALL / BODY / MIND / MATERIALS / SENSES / SOCIAL views |

The terminal pair is therefore distributed across the first three page lengths instead of being placed inside a phone shell. The Extended, paired-dashboard, and metric-stack references occupy distinct movements so similar graphics are not stacked into one congested panel.

## Quantitative integrity

- Viewer-derived peak years, positive-year counts, continuous trends, and the old `73%` readout are absent from the production component.
- Compound denominators remain `30` total with domain counts `6 / 5 / 6 / 7 / 6`.
- Media denominators remain `12` total with system counts `3 / 3 / 2 / 4`.
- Origin claim states remain `4 core / 4 use-with-care / 1 boundary / 2 excluded`.
- Suspicion remains `7` source-bound anchors. Charge is explicitly ordinal `1–3`; no continuous trend or prevalence is implied.
- Human evidence remains `25` equal marks grouped `5 support / 5 replacement / 4 continuation / 11 modeled`. The globe does not encode the previously misread confidence split.
- A filtered dot-matrix view retains all 30 slots and announces `N active of 30`, rather than changing the visual denominator.

Reference geometry never overrides the data contract. The Extended reference contains 31 visual segments, but this implementation renders the 11 real claims. The metric-card reference contains eight bars per card, but the implementation renders only the available production-safe groups rather than inventing bins.

## Geometry evidence

The following viewport measurements are the retained pre-projection layout baseline. Page shells and four-movement order are unchanged, but the final SVG control rows and sphere diameter require a fresh browser measurement before visual acceptance.

At 390 × 844 after the continuous-field correction:

- section heights: `1160 / 1040 / 1191 / 844 px`;
- phrase-tree figure: approximately `182 × 566 px` including its controls and reading key;
- human-functions figure: approximately `350 × 366 px`, with a `273 px` sphere;
- page 2 paired plots: two approximately `170 × 190 px` borderless plots with a `6 px` gap;
- the three metrics form one continuous `350 px` wide band with no rounded shells or gaps;
- dot matrix: `348 × 348 px`, 36 fixed slots, 30 visible marks;
- document and article horizontal overflow: `0 px`.

At 430 × 932:

- section heights: `1183 / 1040 / 1191 / 932 px`;
- phrase-tree figure: approximately `203 × 589 px`;
- human-functions figure: approximately `390 × 366 px`, with a `288 px` sphere;
- dot matrix: `380 × 380 px`;
- document and article horizontal overflow: `0 px`.

The first and third movements are deliberately slightly taller than a 390 × 844 viewport to preserve the readable 3D evidence field and reference proportions, as requested.

## Surface-area audit

The earlier surface baseline is retained only as pre-correction history. It is not reused as acceptance evidence after the black-field merge because card shells were removed and the interactive fields grew. A fresh surface-category audit remains part of final user visual acceptance.

The four data movements now total `4235 px` at 390 px width. No revised 60 / 30 / 10 percentage is claimed here: the removed card shells change the classification boundaries, so the final ratio must be recalculated from corrected rendered bounding boxes before acceptance.

## Interaction and reflow evidence

- The two interactive fields are isolated SVG client islands with a shared orthographic projection for their nodes and relationship lines; no mobile Three.js, WebGL, Canvas, Motion, or idle animation is imported.
- Compound records form a deterministic `root → 5 domains → 30 terms` tree. Human evidence forms four deterministic orbital layers containing `5 / 5 / 4 / 11` records.
- Every production record has one constant-diameter SVG core circle. Halos are concentric decoration attached to the same coordinate; no satellite or random marks are generated.
- Left, reset, and right controls move in deterministic `16°` steps and become disabled at their applicable `−48° / 0° / +48°` boundaries. `ArrowLeft`, `ArrowRight`, and `Home` provide the same keyboard model.
- A primarily vertical drag left yaw unchanged and did not enter the dragging state.
- Rotation and matrix controls are native `button` elements with `44 × 44 px` targets. Rotation controls occupy a separate row rather than covering data nodes.
- With reduced motion requested, drag projection updates once on release rather than continuously; buttons and keyboard remain available.
- The dot switch reports current view, position in the six-view cycle, next view, and an `aria-live` result.
- At the browser's minimum narrow override (`240 px`, used as the available 200% reflow proxy), the document had `0 px` horizontal overflow. The dot matrix reflowed to `3 × 12`; its title, counts, control, and grid did not overlap.
- The final server-rendered route contained exactly `30` compound core circles, `25` evidence core circles, and two complete three-button rotation groups. `Math.random` was absent.

### Continuous-yaw geometry audit

- The complete human evidence range was scanned from `−48°` through `+48°` at `0.01°` increments, then the nearest pair was solved more precisely.
- Minimum centre distance: `3.188407` SVG units at `−42.008292°`, between `REP:3` and `CON:2`.
- Record-core diameter: `2.30` SVG units, leaving `0.888407` units of centreline clearance before stroke adjustment; no record cores merge anywhere in the allowed interaction range.
- At the seven deterministic control positions (`−48 / −32 / −16 / 0 / +16 / +32 / +48°`), minimum centre distance remains between `4.5845` and `6.4456` units.
- Tree and sphere relation paths use the same projection functions and radii as their nodes. The current 72-segment orbit paths remain visually continuous at the rendered sphere size while reducing per-frame path work during Safari rotation.
- All sphere cores and halos remain inside the SVG viewBox across the full yaw range.

## Screenshots

- `screenshots/artificial-mobile-390-full.jpg`
- `screenshots/artificial-mobile-390-page-1.jpg` through `artificial-mobile-390-page-4.jpg`
- `screenshots/artificial-mobile-430-full.jpg`
- `screenshots/artificial-mobile-430-page-1.jpg` through `artificial-mobile-430-page-4.jpg`
- `screenshots/artificial-mobile-200-percent-reflow.jpg`
- `screenshots/artificial-desktop-1440x900-non-regression.jpg`
- `screenshots/artificial-shell-390-top.jpg`
- `screenshots/artificial-shell-390-close.jpg`
- `screenshots/artificial-shell-430-top.jpg`
- `screenshots/artificial-shell-430-close.jpg`
- `screenshots/artificial-shell-desktop-1440-non-regression.jpg`
- `screenshots/artificial-interaction-390-registry.jpg`
- `screenshots/artificial-interaction-390-evidence.jpg`
- `screenshots/artificial-interaction-390-functions.jpg`
- `screenshots/artificial-interaction-390-matrix.jpg`
- `screenshots/artificial-interaction-390-close.jpg`

The five retained source images are in `references/`.

The listed screenshots document earlier milestones and must not be read as evidence of the final continuous-black correction. The corrected route was instead checked live at 390, 430, and the browser's 240 px minimum: every top-level Artificial surface computed transparent over the same black grid, interaction controls remained 44 px, and no horizontal overflow or fresh console/hydration warning occurred. Current acceptance remains explicitly pending (`READY_FOR_USER_VISUAL_ACCEPTANCE=false`).

The final localhost route was rebuilt from a clean development cache and returned HTTP `200`. Production `next build`, standalone TypeScript, data checksum validation, and mobile-governance validation all passed.

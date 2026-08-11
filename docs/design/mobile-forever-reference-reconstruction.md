# Mobile Forever — reference reconstruction and approved figure contract

**Status:** implementation specification supplied and authorised by the user on 2026-08-11

**Applies to:** the mobile-only `/words/forever` edition

**Does not apply to:** Desktop Forever, Home, About, Privacy, or any other word study

This document records the pixel reading, data meaning, figure/card contracts, 390 px storyboard, and planned surface allocation that precede implementation. The four supplied images are binding composition authorities. They are not generic mood-board references.

## 1. Reference inventory

| Ref | Supplied file | Pixel dimensions | Mobile Forever assignment |
| --- | --- | ---: | --- |
| 1 | `codex-clipboard-2859615f-3708-4ce7-8a7a-5690d58aeec1.png` | 736 × 736 | F02 first transition and Rail B |
| 2 | `codex-clipboard-85725e00-285e-479e-ad21-076f1ee91fc7.png` | 606 × 910 | F03 spelling-composition mosaic |
| 3 | `codex-clipboard-d4d85048-40cb-4580-bfa9-620e32081243.png` | 1200 × 900 | F01 long arc and Rail A |
| 4 | `codex-clipboard-a471a10d-5ac7-4c4b-8b8e-faeed4a5817c.png` | 597 × 745 | F04 metric conditions and Rail C |

### Omitted device-only material

All four reconstructions omit phone bezels, notches, cameras, status bars, home indicators, watermarks, third-party brand names, avatars, product copy, reference-product numbers, and reference-product copyright text. No other reference-defining geometry is omitted.

## 2. Measured spatial signatures

Measurements are reported as `left / top / width / height`, normalised to the relevant screen or mosaic field. Values are rounded to the nearest 0.5 percentage point because antialiasing and device shadows soften the visible boundaries.

### Reference 1 — saturated report field

The right device's internal sheet is approximately 251 × 477 px inside the 736 px source. Its compositional regions are:

| Region | Normalised bounds | Retained relationship |
| --- | --- | --- |
| top yellow cap | 0 / 0 / 1 / 0.075 | full-width, shallow rounded cap |
| green analytical panel | 0 / 0.08 / 1 / 0.38 | tall chart panel, capsule label at upper left, circle affordance at upper right |
| pale evidence panel | 0 / 0.47 / 1 / 0.43 | quiet row ledger with rules and compact bars |
| black footer field | 0 / 0.91 / 1 / 0.09 | closing rule and tightly tracked metadata |

The left device contributes the neutral lead panel and yellow dominant-number panel. Card corners read as roughly 20–24 px after scaling to a 342 px mobile content width; internal padding reads as 17–20 px; black inter-panel gutters read as 5–7 px. The dominant number sits in the lower half of its panel, with a unit aligned independently near its baseline. Thin result rules are one physical pixel in the source and become 1 CSS px.

F02 retains the black full-width ground, neutral/yellow/green/pale sequence, large rounded panels, outlined capsule labels, circular outline affordances, dense chart-to-number relationship, rule system, and bottom segmented capsule. The photographic region becomes a low-contrast annual texture derived only from the 1882–1887 joined-share values.

### Reference 2 — interlocking 2:3 mosaic

The visible mosaic occupies approximately x 70–578 and y 54–893: 508 × 839 px. Normalised tile bounds are:

| Tile | Normalised bounds | Approximate scaled bounds at 342 × 564 px |
| --- | --- | --- |
| upper-left | 0 / 0 / 0.502 / 0.345 | 0 / 0 / 172 / 195 px |
| upper-right | 0.500 / 0 / 0.500 / 0.532 | 171 / 0 / 171 / 300 px |
| middle-left | 0 / 0.345 / 0.504 / 0.484 | 0 / 195 / 172 / 273 px |
| middle-right | 0.500 / 0.532 / 0.500 / 0.468 | 171 / 300 / 171 / 264 px |
| lower-left | 0 / 0.829 / 0.504 / 0.171 | 0 / 468 / 172 / 96 px |

The centre seam overlaps by about one source pixel. Junctions are flush rather than separated into equal generic cards. External and exposed corners are 28–31 source pixels, which becomes approximately 20 px at the target width. Tile labels occupy the upper-left 8–10% of each tile; giant values sit against the lower-left edge with approximately 7% inline inset and 5% block inset. The black ground is visible only at the interlocking negative-space boundaries.

F03 retains the exact five-region silhouette, black ground, orange tonal hierarchy, large lower-left values, sparse labels, rounded exposed corners, and crossing-neighbour geometry. Colour is reassigned by form: orange family for `forever`, blue family for `for ever`, neutral paper for the stability band.

### Reference 3 — paired pale analytical sheets

The two screen interiors are approximately 346 × 755 px. Device hardware is removed and the interiors are stacked as independent full-width sheets.

#### Left sheet

| Element | Normalised position/extent |
| --- | --- |
| oversized two-line title | x 0.05–0.92; y 0.14–0.31 |
| quiet period row | y 0.36–0.40 |
| primary chart field | y 0.42–0.94 |
| five columns | equal 0.145–0.155 widths with approximately 0.055 gaps |
| solid/hatched split | data-driven within each zero-based full column |

The source bars deliberately vary in height, place labels directly on or immediately beyond segment endpoints, and use diagonal hatching at approximately 45 degrees with 6–8 source-pixel pitch. F01A uses a zero-based 0–70 domain. Full height encodes combined exact-form rate, orange solid height joined rate, and blue hatching spaced rate.

#### Right sheet

| Element | Normalised position/extent |
| --- | --- |
| oversized two-line title | x 0.05–0.92; y 0.14–0.31 |
| stepped block field | y 0.40–0.88 |
| first block | width 1.00; height about 0.22 |
| second block | width 0.76; height about 0.18 |
| third block | width 0.52; height about 0.18 |
| quiet three-column footer | y 0.90–0.96 |

F01B retains the pale violet full sheet, stepped edge-to-edge blocks, very large direct values, subordinate labels, and quiet three-column footer.

### Reference 4 — nested condition controls and terminal stems

The usable screen interior is approximately x 162–431 and y 113–663: 269 × 550 px. The upper and lower panels occupy:

| Region | Normalised bounds | Retained relationship |
| --- | --- | --- |
| upper control panel | 0 / 0 / 1 / 0.443 | capsule selectors, rule and metadata |
| inter-panel gap | 0 / 0.443 / 1 / 0.029 | quiet neutral gutter |
| lower chart panel | 0 / 0.472 / 1 / 0.528 | ten stems, terminal segments and dotted guide |

Corners read as 13–15 source pixels, approximately 18–20 px after scaling. Upper-panel padding is about 7% of width. The three selector pills occupy equal thirds of one long capsule; the active state is dark and the micro-mark reverses to light. The lower chart uses ten equal rhythm positions, a subdued stem, a short saturated terminal extension, a small rounded endpoint, and a quiet dotted guide.

F04 retains this two-panel proportion, three-part capsule, independent metric states, intensity-style rule, ten-stem rhythm, rounded terminal segments, endpoint guide, and sparse edge labels. Device close/play controls and hearing-product copy are omitted.

## 3. Approved data boundary

- Release: `googlebooks-eng-20200217` (`eng_2019`; raw directory `20200217/eng`).
- Complete public analysis window: 1800–2019.
- Core exact forms: `forever` (1-gram) and `for ever` (2-gram).
- Rate: exact-form yearly or decade match counts divided by same-release 1-gram word-token totals, multiplied by 1,000,000.
- Reach: containing-volume incidences divided by same-release corpus volume totals, multiplied by 1,000,000.
- Repetition: exact-form appearances divided by containing-volume incidences.
- Decades: sum all ten annual numerators and denominators before division.
- Sparse raw absence is `absent_or_suppressed`, never an inferred zero.
- Viewer order-specific fractions, `forevermore`, the trigram phrase, Gutenberg selections, prehistory and modern snippets are outside the rendered contract.

Public interpretation is bounded to this fixed corpus release. The figures do not establish language-wide spelling adoption, semantics, first use, social acceptance, causation, or an OCR-/composition-bias-free population trend.

## 4. Primary figure contracts

### F01 — Long historical arc

- **Question:** How do the total exact-form visibility and joined/spaced composition change from the 1820s peak through the 1980s low and 2010s return?
- **Raw fields:** exact form, year, `match_count`, `volume_count`; totalcounts year, word tokens and corpus volumes.
- **Filter:** both exact core forms; 1800–2019; five anchor decades 1820s, 1880s, 1890s, 1980s, 2010s.
- **Grouping:** decade, then form.
- **Formula:** aggregate numerators/denominators first; rate per million word tokens; joined share from joined / pair exact-form match counts.
- **Unit:** exact-form appearances per million corpus word tokens.
- **Marks:** F01A stacked vertical columns on 0–70; F01B three stepped blocks containing 68.59, 12.22 and 35.65.
- **Valid reading:** the pair peaks in the 1820s, falls to its lowest anchor in the 1980s, and partially returns by the 2010s.
- **Prohibited reading:** full recovery, linguistic population frequency, or semantic replacement.
- **Production eligibility:** requires fixed raw common-denominator contract, same-release totals, checksum/rights/transform closure and complete ten-year decade inputs.

### F02 — First transition

- **Question:** Does the joined spelling become the majority because it grows, or because the spaced spelling retreats faster?
- **Raw fields:** annual exact-form counts, annual word-token totals and containing-volume counts.
- **Filter:** 1882–1887 for the annual sequence; 1880s and 1890s for transition results.
- **Grouping:** year and decade/form.
- **Formula:** exact-form rates and joined share; percent change between exposure-weighted decade rates; share change in percentage points.
- **Unit:** share in percent; change in percentage points; rates in exact-form appearances per million corpus word tokens.
- **Marks:** yellow dominant +6.73 pp result, six real annual positions, 50% threshold, direct 1884/1885/1886 labels and row ledger.
- **Valid reading:** the decade-level majority appears while joined rate is effectively flat and spaced rate falls sharply.
- **Prohibited reading:** a single-year irreversible switch or causal account.
- **Production eligibility:** fixed raw contract plus all six annual rows and both complete transition decades.

### F03 — Second transition / spelling composition

- **Question:** Does the late pair rebound change the already-settled spelling composition?
- **Raw fields:** decade aggregate counts and totals for 1980s–2010s.
- **Filter:** 1980s, 1990s, 2000s, 2010s.
- **Grouping:** decade/form.
- **Formula:** decade rates, joined share, 1980s→2010s factors, and the 1990s–2010s joined-share range.
- **Unit:** percent share, rate per million corpus word tokens, and dimensionless factors.
- **Marks:** five fixed interlocking tiles; two form-share tiles for each endpoint decade plus one stability-band tile.
- **Valid reading:** both forms rebound while joined share remains near four-fifths.
- **Prohibited reading:** a second orthographic switch or causal attribution.
- **Production eligibility:** fixed raw contract and four complete decades.

### F04 — Interactive conditions

- **Question:** Is the 2010s joined advantage mainly visibility across books or repetition within containing books?
- **Raw fields:** decade match counts, containing-volume incidences, word tokens and corpus volume totals for 1920s–2010s.
- **Filter:** ten complete decades 1920s–2010s.
- **Grouping:** decade/form and selected metric.
- **Formula:** RATE, REACH and REPEAT as defined above; independent domains per metric.
- **Units:** distinct, visible units for each metric.
- **Marks:** ten subdued spaced-form stems, orange extension to joined value, joined terminal pill, dotted joined endpoint guide; selector morphs geometry and local reading.
- **Valid reading:** the 2010s rate and reach ratios are about four, while repetition ratio is near one.
- **Prohibited reading:** comparing magnitudes across the three units or treating decomposition as causation.
- **Production eligibility:** fixed raw contract, complete 1920s–2010s decade rows, and stable server-rendered RATE default.

## 5. Evidence-card contracts and swipe order

All rails use a 24 px inset at 390 px, 326 px card width, 12 px gap, about 28 px adjacent-card cue, native horizontal scroll and mandatory snap. Each card is default-closed native `details`; the collapsed summary contains the full data front, a real microvisualisation, exact local unit and a 44 px `DETAIL / SOURCE +` action row. Extended interpretation, definition, source, release and caveat sit inside the body.

### Rail A — long arc

1. `1820s / PEAK / 68.59`
2. `1980s / LOW / 12.22`
3. `2010s / RETURN / 35.65`

### Rail B — annual first turn

1. `1884 / FIRST CROSSING / 50.16%`
2. `1885 / REVERSAL / 46.33%`
3. `1886 / SUSTAINED / 53.82%`

### Rail C — rebound mechanism

1. `forever / 3.02×`
2. `for ever / 2.56×`
3. `pair / 2.92×`

Only one card in a rail remains open. Native named-details behaviour is the semantic baseline; a minimal enhancement closes siblings where browser support requires it. The rail never creates body-level overflow.

## 6. 390 px storyboard

The collapsed reading order is fixed:

1. existing site header;
2. compact study identity, H1 and one-sentence thesis;
3. F01A `VISIBILITY / FORM` pale-blue tall sheet;
4. F01B `PEAK / LOW / RETURN` pale-violet stepped sheet;
5. Rail A, three pale evidence cards;
6. F02 black report field with neutral, yellow, green and pale panels plus segmented state capsule;
7. Rail B, three saturated annual cards;
8. F03 heading and black 2:3 five-tile composition field;
9. Rail C, three pale nested-panel mechanism cards;
10. F04 pale neutral condition module with upper controls and lower chart;
11. one closing finding sentence;
12. `Citation / rights / links`, native details, closed;
13. existing Words Over Time footer language.

No audit preamble, implementation state, gate language, desktop component, generic dashboard card, device shell, or unapproved evidence layer appears.

## 7. Planned collapsed-surface allocation

The implementation will be measured from actual 390 px bounding boxes. The pre-code allocation is:

| Category | Planned height | Planned share |
| --- | ---: | ---: |
| primary visualisations: F01A/F01B/F02/F03/F04 | 2,820 px | 60.0% |
| collapsed swipeable evidence rails A/B/C | 1,410 px | 30.0% |
| identity, navigation, connective copy, closed citation and footer | 470 px | 10.0% |
| **Total** | **4,700 px** | **100%** |

These are design budgets, not min-heights or whitespace targets. Final CSS must derive height from the reference composition and real marks. After rendering, the machine audit must report actual bounding boxes and satisfy 60 / 30 / 10 within ±2 percentage points.

## 8. Accessibility and fidelity gates

- Exactly one H1.
- Minimum visible text 13 px; interactive targets at least 44 × 44 px.
- Form identity is direct-labelled and position-redundant, not colour-only.
- SVG figures include concise title and description.
- RATE is meaningful in server HTML and without JavaScript.
- Flip tiles, metric selectors, card disclosures and rail controls are keyboard operable.
- Reduced motion removes rotational/morph animation without hiding state changes.
- Body overflow is zero at 240, 320, 390 and 430 px; only rails scroll intentionally.
- Citation / rights / links and every evidence card are closed by default.
- Public copy excludes `match`, audit, gate, STOP, unauthorized and contract status.
- Each implementation crop is paired with its reference before visual completion is claimed.

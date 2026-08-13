# Privacy mobile — two-field widget predesign

**Status:** IMPLEMENTED / USER VISUAL REVIEW IN PROGRESS
**Viewport:** 390 px storyboard
**Research artifact:** `docs/research/privacy/mobile-2026-08/privacy_mobile_analysis.json`

## 1. Editorial claim

Privacy is not presented as one continuous line from secrecy to technology. The mobile edition asks a narrower, data-supported question:

> How did privacy become both an object of public attention and an operating infrastructure made from policy language, controls and institutions?

The page therefore has two continuous fields, not five isolated chapter scenes:

1. **ATTENTION** — what selected readers opened and how that mix changed.
2. **INFRASTRUCTURE** — how frozen documents and verified institutions operationalize privacy.

The page does not claim language-wide adoption, public opinion, legal completeness, first use, platform quality, or causal effects.

## 2. Reference reconstruction

### Binding reference 1 — full-surface activity + overlaid widgets

Reconstruct:

- a tall upper visualization occupying most of the field;
- an overlapping description/statistic widget anchored to its lower edge;
- a single-column widget sequence broken into short editorial groups at 390 px;
- large data marks with restrained copy;
- flat warm-gray surfaces with no ornamental dashboard chrome.

Use for figures 01, 02 and 03. Do not copy credit-card branding, phone chrome, money symbols or navigation controls.

### Binding reference 2 — statistics dial + dot matrix

Reconstruct:

- a circular or annular summary that frames one real share;
- a two-column asymmetric module beneath it;
- a full-width dot matrix where positions are meaningful;
- simple black/gray marks plus one functional color;
- dense evidence contained within the viewport without a swipe rail.

Use for figures 01, 02 and 04. The grid cells encode registered routes and years, not decoration.

### Reference 3 — extension only

Borrow saturated card adjacency, sectional color blocks and large result typography. Do not copy the black application shell or generic avatar/navigation UI.

### Reference 4 — visualization grammar only

Borrow compact sparklines, bar groups, progress strips and mixed widget proportions. Every mark must remain tied to a contract field.

## 3. 390 px storyboard

Approximate heights are predesign estimates, not implementation min-heights.

| y range | module | evidence / composition |
|---:|---|---|
| 0–96 | site header | Existing mobile publication header; no new navigation language. |
| 96–250 | subject | `PRIVACY/`, one plain-language thesis sentence, compact source-period row. |
| 250–1030 | **Field A / ATTENTION** | Figure 01: eight-year stacked activity field. Governance/concept/pressure share sits over annual selected-page totals. An overlaid flip card states the bounded finding. |
| 1030–1810 | grouped widget sequence | Figure 02: nine common-window topic widgets plus one plain-language low-share bridge for `Data privacy`, separated into short reading groups. Each widget retains topic share, peak relation, and a microvisual. Selected detail flips in place; no horizontal swipe. |
| 1810–1918 | black rule / field turn | Strong divider, field label and one short transition. |
| 1918–2760 | **Field B / INFRASTRUCTURE** | Figure 03: five full-width document widgets in groups of 2 / 3, separated by a short document-scale reading. Each shows the distribution of positive exact phrase matches. Observed-zero phrases remain in the artifact but are not drawn as positive marks. |
| 2760–3550 | institutional grid | Figure 04: 17 verified anchors across seven routes. Dots and bridges use year/route membership; a small source card overlaps the lower edge. |
| 3550–3890 | evidence boundary | Figure 05: compact coverage ledger distinguishes observed, suppressed, unavailable, incomparable and out-of-scope layers. |
| 3890–4100 | folded source / copyright | Native disclosures; essential units and principal limitations have already appeared locally. |
| 4100–4180 | final footer | Existing mobile research-edition footer language. |

The storyboard uses natural module content; no card receives a height solely to hit the surface ratio.

## 4. Figure and card order

### 01 — Attention changes shape

- **Visible:** 2018–2025 annual field, category shares, direct 2018/2025 labels, complete-year boundary.
- **Overlay front:** “Governance pages are a larger part of this selected-page mix than in 2018.”
- **Overlay back:** definition, selected-page denominator, Wikimedia source, partial-2026 exclusion.
- **Marks:** annual bar height = views; stacked color = registered category share.

### 02 — Ten windows onto privacy

- **Visible:** nine fixed widgets plus a plain-language `Data privacy` bridge; every widget shows page title, exact share of the selected ten-page inventory, and a separately labelled relation to that topic’s own peak. The widgets deliberately reconstruct five reference grammars—progress, segmented performance, analytics line, balance gauge, and annual activity bars—repeated no more than twice each. The 0.52% `Data privacy` share remains explicit in prose rather than being promoted as a dominant widget number. The coverage-incomplete GDPR topic remains in the coverage ledger, not a zero-filled widget.
- **Interaction:** tap flips only the selected widget; background widgets are inert until it closes. No swipe, no carousel, no arrow navigation.
- **Layout:** the mobile sequence is full-width and grouped 3 / 4 / 3. Plain-text interludes interrupt the ten-card run and explain the changing evidence lens without becoming cards.

### 03 — Privacy becomes interface language

- **Visible:** five included captured documents; ten preregistered phrases; positive exact matches shown as shares of the document's total registered-phrase hits.
- **Interaction:** the five full-width widgets are grouped 2 / 3; each may flip to source, token count, capture boundary and warning that frequency is not policy quality. Dense documents use an exact-share segmented strip plus count-and-percent rows; compact documents use proportional bars or columns. Sub-one-percent values retain their exact count and percentage instead of being inflated into a coarse dot.
- **Zero rule:** `observed_zero` stays in the generated artifact and source disclosure but receives no filled mark and is omitted from the compact positive-term ranking. A small positive share is never rounded to a displayed zero.
- **Missing:** three captures below the token floor are shown in the coverage ledger as `absent_or_suppressed`, never as zero-filled widgets.

### 04 — One idea, many institutions

> **Supersession note (2026-08-12):** The earlier year-by-route matrix and the later black/purple transfer-dot panel are permanently rejected for mobile. Both created abstract repetition without enough local meaning. The approved replacement uses a direct multi-route percentage, full-width percentage bars with an explicit shared 17-source denominator, and a default-folded record ledger.

- **Visible:** a direct 12/17 multi-route result and seven full-width percentage bars using the same 17-source denominator.
- **Interaction:** the compact finding card flips for method/source; all 17 dated records remain in a native default-closed disclosure.
- **Meaning:** route bars overlap and must not be summed to 100%; they show registered classification among the 17 retained sources, not causation or influence.

### 05 — What this page can and cannot claim

- **Visible:** evidence-state ledger with the full missingness vocabulary.
- **Folded:** detailed source/rights list.
- **Purpose:** makes the exclusions auditable without rendering an internal audit/status page.

## 5. Grid rationale

- **Page grid:** 16 px outer gutter; 6-column modular grid; 8 px baseline.
- **Primary fields:** full available width. They visually divide the page into attention and infrastructure without separate viewport scenes.
- **Widget sequence:** one full-width card per row at 390 px, with 10–12 px card gaps and short text interludes between evidence groups.
- **Overlay:** explanation cards overlap visualization edges by approximately 16–24 px, but never cover direct units or focal values.
- **Reading order:** DOM order follows the visual order. Overlay cards occur after the graphic they explain.

## 6. Visual system

- **Identity:** retain wheat paper, Helvetica authority, monospace evidence labels, black rules and existing publication footer.
- **Privacy base:** violet remains the route identity but is not the only evidence color.
- **Functional expansion:** warm coral = public attention; muted blue = governance; black = pressure/focal selection; pale gray-green = document layer; white/cream = inactive surface.
- **Typography:** body 16–17 px; notes 14 px; metadata 13 px; chart labels 12–14 px; no evidence text below 12 px and no visible text below 11 px.
- **Motion:** a short, reduced-motion-safe in-place flip. No scroll-driven expansion, no gesture conflict with page scrolling, and no swipe rail.

## 7. Surface-area estimate

Estimated analytical content height, excluding global header/footer: 3,590 px.

| role | estimated px | share |
|---|---:|---:|
| primary visualizations (01, 04 and main graphic regions of 02/03) | 2,150 | 59.9% |
| widget / expandable cards | 1,085 | 30.2% |
| always-visible headings, transitions and short thesis text | 355 | 9.9% |

This is a predesign estimate only. After implementation, the ratio must be recomputed from rendered bounding boxes; fixed heights or padding may not be added to force it.

## 8. Approval gate

All five contracts are data-eligible, but `implementationAuthorized=false` until the user explicitly approves:

- the two-field narrative;
- the five-module order;
- the non-swipe two-column widget system;
- the reference mapping above;
- the 390 px rhythm and estimated 60/30/10 distribution.

No Privacy page component, CSS, route, desktop file or SEO file is changed by this predesign package.

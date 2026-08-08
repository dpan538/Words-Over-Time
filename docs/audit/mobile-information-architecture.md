# Mobile-first information architecture

**Audit date:** 2026-08-08

**Scope:** `/`, `/words`, and the six published word studies, with the implementation priority on `/words/forever`

**Status of this document:** pre-implementation architecture and acceptance specification

## Evidence rules

This document deliberately separates source inspection from browser evidence:

- **Code-confirmed** means the behavior follows directly from the checked-in component structure or CSS.
- **Runtime verification required** means a browser, device, screenshot, accessibility-tree, or performance run is still needed.
- No ranking, traffic, Core Web Vitals, or accessibility improvement is claimed here. Search changes are hypotheses until measured.
- The uncommitted privacy mobile demo (`src/app/words/privacy/mobile-demo/` and `src/components/privacy/PrivacyMobileExperience.tsx`) is user work and is excluded from this architecture. It was not edited, adopted into the canonical route, or treated as shipped behavior.

## Product principle

Words Over Time is a source-led research publication. Mobile IA must make the research claim, evidence boundary, and navigation legible before asking a reader to operate a visualization. It must not turn the project into a dictionary, a generic card dashboard, or a set of unsupported “quick definitions.”

The mobile page should answer four questions in order:

1. What is this study asking?
2. What can the current evidence support?
3. What evidence and date ranges are present or absent?
4. Where can the reader inspect, cite, and share the evidence?

Interaction adds resolution; it must not unlock the primary meaning.

## Current-state audit

### Home (`/`)

| Finding | Evidence | Consequence | Priority |
| --- | --- | --- | --- |
| The word rows and every word token use `whitespace-nowrap`; the list has a minimum `clamp()` size of about 3.9rem. | Code-confirmed in `src/components/WordList.tsx`. | Long words have a deterministic overflow risk at narrow widths. Whether the body actually overflows must be measured at each viewport. | P0 |
| Published-study labels and “coming soon” are hidden until hover. | Code-confirmed in `src/components/WordCard.tsx`. | Touch and keyboard users do not receive a persistent status or the short hover label. | P0 |
| The project explanation follows the complete oversized word list, while the formal H1 is a low-contrast line at the bottom of the page. | Code-confirmed in `src/app/page.tsx`. | The first mobile screen may communicate a word menu before it communicates the source-led purpose. | P0 |
| Primary navigation exposes only Home and About. | Code-confirmed in `src/components/Nav.tsx`. | The server-rendered `/words` index is not directly available in global navigation. | P0 |
| The page keeps the wheat background, black rules, oversized typography, and flat poster composition. | Code-confirmed. | These are identity assets to preserve, not defects to replace with rounded cards or a SaaS header. | Preserve |

**Runtime verification required:** body `scrollWidth` at 320, 360, 390, and 430px; 200% text zoom; visible focus indicators; whether the first 568px of height contains the project purpose; and screenshot comparison against desktop.

### Word index (`/words`)

The index is already a strong server-rendered navigation surface. It contains one H1, canonical word links, summaries, and keyword labels. Its layout collapses to a single column before the `lg` breakpoint, so it does not require the home page's oversized row treatment.

Improvements should remain small:

- add `/words` to the global navigation;
- retain the current no-JavaScript list rather than adding a filter until the study count makes a filter useful;
- expose publication status and evidence/coverage information using the same vocabulary as Home;
- keep the entire row as one understandable link, with a visible focus state and no hover-only information.

**Runtime verification required:** link target size, heading wrapping, 200% zoom, and body overflow.

### Shared word-page shell

The published pages share a visual hero, coverage register, poster chapters, and a bottom `WordSeoSummary`, but they do not yet share a server-rendered research-entry shell.

| Route | Current boundary | Mobile behavior visible from code | IA risk |
| --- | --- | --- | --- |
| `/words/forever` | The large `ForeverPoster` is a top-level Client Component and contains the H1, hero, controls, and all figures. | One explicit mobile frequency fallback; other large figures scroll horizontally or shrink. | The direct answer and H1 are coupled to a large client boundary; chapter navigation is visual progress rather than anchor navigation. |
| `/words/depression` | The large `DepressionPoster` is a top-level Client Component and contains the H1 and figures. | Several figures use 1080px+ local canvases/SVGs; an annotation strip is fixed to the bottom when active. | The primary text is coupled to a large client boundary; figure inspection and fixed content need mobile focus/coverage checks. |
| `/words/artificial` | Poster shell is a Server Component; several chart islands use Three.js or wide SVGs. | The panel register stacks, but multiple figures are spatial/3D or horizontally scrollable. | Primary meaning can become subordinate to heavy interaction. |
| `/words/privacy` | Poster shell is a Server Component and sends selected data slices to chart islands. | Responsive chart canvases exist, with mixed pointer/keyboard support. | No canonical mobile reading sequence places ranked geographic evidence before the map. |
| `/words/hub` | Poster shell is a Server Component; child islands include Three.js, radial diagrams, and evidence cards. | Some diagrams scale, some interactions are pointer-led, and Chart 01 has a tall WebGL area. | 3D and radial form can precede the ranked terms that explain the evidence. |
| `/words/data` | Poster shell is a Server Component with four client chart islands. | Several figures use local horizontal scrolling; Socialized Generation has a 1340px minimum layout and Cross-Pressures has a 1440px SVG. | A mobile reader can encounter desktop composition before the historical route is stated vertically. |

The common bottom `WordSeoSummary` already preserves useful related-study and methodology links. It should be refactored into a research conclusion/canonical-page footer, not removed. Its generic “search summary” language must not duplicate the direct answer at the top.

### Forever-specific current behavior

The following are code-confirmed in the pre-implementation state:

- `FrequencyTimeline` replaces the chart below 640px with “This visualization requires a wider screen” and asks the reader to rotate or use desktop. It lists four series but does not provide a usable mobile chart.
- The desktop frequency SVG has a 1320px minimum width and uses local horizontal scrolling.
- `RelationalConstellation`, `ContextSignalField`, and `EvidenceArchive` use minimum SVG widths of 1540px, 1400px, and 1420px respectively.
- Interactive SVG marks in those three figures are primarily mouse-enter/mouse-move/click targets without equivalent focusable controls.
- `ContextSignalField` auto-rotates on an interval; the current component does not check `prefers-reduced-motion`.
- the “permanence under suspicion” globe initializes Three.js and a continuous animation immediately. Four evidence cards remain readable if WebGL fails, which is a useful static foundation.
- `VariantDriftField` includes continuously animated SVG elements without a local reduced-motion rule.
- `MiniInspectorMenu` is a fixed 20rem panel positioned from pointer coordinates. It has a close button when pinned, but no dialog semantics, Escape behavior, focus trap, or focus restoration. Its fixed width also creates a narrow-viewport overflow risk that requires runtime confirmation.
- the Forever figures have SVG/canvas labels but no consistent `figure`/`figcaption`, visible source-and-caveat block, table alternative, or section-copy action.
- the current stable section IDs are `semantic-evolution`, `permanence-under-suspicion`, `relational-constellation`, `context-signal-field`, and `evidence-archive`.

## Target route hierarchy

```text
WordPageShell (Server Component)
├── Global Nav
├── WordStudyHero
│   ├── one H1
│   ├── primary research question
│   └── source-bounded short answer + caveat
├── SearchIntentSummary
│   ├── two or three related questions
│   └── crawlable links to answer sections
├── EvidenceCoverageStrip
├── MobileChapterNav
├── Research chapters
│   ├── server-rendered FigureSummary
│   ├── static/default figure state
│   ├── optional client enhancement
│   ├── source + coverage + caveat
│   ├── optional FigureDataTable
│   └── FigureShareActions
├── ResearchConclusion
├── RelatedQuestions / RelatedStudies
└── CitationAndSharing
```

`WordPageShell`, the H1, the primary question and answer, coverage, caveat, chapter links, figure summaries, conclusion, and citation text are server-rendered. Client boundaries are limited to controls, responsive SVG state, inspector sheets, and optional spatial enhancement.

Primary text must not use `ssr: false`. A 3D or pointer-led enhancement may be client-only only when the same figure's summary, source, caveat, and static/ranked state are already present.

## Mobile reading order

All word studies use this order at a content width below 60rem; the desktop poster can retain its current composition at wider widths.

1. **Word and direct answer.** One H1, one evidence-bounded answer, and one visible caveat.
2. **Related questions.** Two or three anchors, not an accordion.
3. **Evidence coverage.** Date ranges, source layers, missing/comparability gaps, and last-reviewed date.
4. **Chapter navigation.** Current chapter, short title, and a list of real anchors.
5. **Focused figure.** One legible default series/category/state.
6. **Visible interpretation.** A short paragraph whose claims are supported by the linked evidence.
7. **Evidence action.** “Inspect evidence,” “View data table,” or a source link with an accessible name.
8. **Next chapter.** A normal anchor; swipe is never required.
9. **Source archive.** Filterable evidence cards and an accessible inspector.
10. **Conclusion, related studies, and citation.** Reuse the useful content from `WordSeoSummary` without repeating the top answer.

## Home and index target architecture

### Home first screen

The 320px first screen must include:

- “Words Over Time” as the visible identity;
- a one- or two-sentence explanation that this is source-led research into semantic change, historical frequency, spelling/form variation, and usage evidence;
- a direct `/words` link;
- the beginning of the published study list;
- no required horizontal scroll.

The word list remains typographic and flat. Each item becomes a full-width editorial row, not a rounded card:

- word title;
- persistent status: `available study` or `coming soon`;
- one research question or source-bounded summary for available studies;
- coverage/evidence note only when the data record provides it;
- a normal anchor for published studies; a non-link element with visible status for unpublished studies.

Use wrapping and responsive type sizing rather than clipping the word. Do not hide a label on hover, do not make unpublished words appear actionable, and do not add search/filter JavaScript for the present seven-item list.

### Global navigation

Minimum links are Home, Word studies, and About. On narrow screens, wrapping is acceptable. Every link needs a visible focus state and a target height near 44 CSS px. The current editorial underline can remain.

### `/words`

Keep it server-rendered. Match Home's status vocabulary and evidence labels, while retaining the existing summaries and canonical links. A search control is deferred until the number of studies or usability evidence justifies its JavaScript and interface cost.

## Word content model

Search-intent answers must be typed source content, not model-memory definitions. A record is publishable only when it has:

- stable `id`, `route`, and `anchor`;
- a real question;
- a concise answer derived from existing evidence;
- `evidenceBasis` and source/evidence references where available;
- a visible caveat and claim boundary;
- related research section;
- intent label and `lastReviewed` date.

When evidence is insufficient, the answer says what the project has and has not established. A missing answer is preferable to a generic dictionary paragraph.

### Proposed stable anchors

These are IA targets, not claims that every answer is currently evidence-complete. Content publication requires an evidence mapping review.

| Route | Proposed canonical anchors |
| --- | --- |
| Forever | `#spelling`, `#origin`, `#meaning-over-time`, `#permanence-under-suspicion`, `#phrases-and-collocates`, `#semantic-contexts`, `#evidence-archive`, `#conclusion`, `#citation` |
| Privacy | `#etymology`, `#historical-meaning`, `#legal-and-data-meaning`, `#privacy-and-surveillance`, `#geographic-attention`, `#governance`, `#sources`, `#citation` |
| Artificial | `#original-meaning`, `#created-by-artificial-means`, `#meaning-before-ai`, `#mechanical-reproduction`, `#artificial-intelligence`, `#sources`, `#citation` |
| Hub | `#origin`, `#wheel-to-network`, `#transport-node`, `#network-metaphor`, `#naming-machine`, `#sources`, `#citation` |
| Data | `#datum`, `#singular-and-plural`, `#etymology`, `#governance`, `#ai-era-meaning`, `#sources`, `#citation` |
| Depression | `#loweredness`, `#weather`, `#economic-meaning`, `#clinical-meaning`, `#semantic-branching`, `#sources`, `#citation` |

Existing Forever anchors must continue to resolve. Add aliases adjacent to the corresponding canonical section rather than silently renaming or using page-load JavaScript. Specifically retain `#semantic-evolution`, `#relational-constellation`, and `#context-signal-field` while introducing the clearer query-facing aliases. Preserve the URL hash during load, hydration, filtering, and inspector state changes.

## Reusable mobile components

### `MobileStudyHeader`

- Server-rendered word, primary question, direct answer, caveat, and last-reviewed date.
- Exactly one page H1.
- Does not repeat the poster introduction verbatim.
- The direct answer is visible without expansion.

### `EvidenceCoverageStrip`

- Uses a semantic `dl`.
- Shows each evidence layer separately, including incompatible date ranges.
- Calls out non-comparable layers rather than presenting one continuous corpus.
- Never implies that frequency start is first attestation.

### `MobileChapterNav`

- An ordered list of crawlable anchors.
- If sticky, it must account for safe-area insets, occupy no more than one compact row when collapsed, and never cover the target heading.
- Active state may be enhanced with `IntersectionObserver`; the complete list and links work without it.
- No mandatory horizontal swipe. A locally scrollable chapter row is acceptable only if all chapters are also available in a normal list/menu.

### `MobileFigureFrame`

- Semantic `figure`, title, summary, source, coverage, visible caveat, `figcaption`, stable ID, data-table option, and copy-link action.
- The primary reading is outside the interactive SVG/canvas.
- The frame itself never establishes a body-level minimum width.

### `MobileInspectorSheet`

- Opens only from an explicit focusable control or a selected chart mark.
- Uses dialog semantics, traps focus while open, closes on Escape and a labelled close button, and restores focus to the trigger.
- Respects `env(safe-area-inset-bottom)` and has an internal maximum height with local scrolling.
- It cannot cover the only copy of a chart's interpretation.

### `FigureSummary`, `FigureDataTable`, and `FigureShareActions`

- Summary and caveat are server-readable text.
- The table has a caption, scoped headers, the same filters as the visible figure, and a local overflow wrapper if needed.
- “Copy section link” copies the canonical `www` URL plus the stable fragment. Success/failure is announced in an `aria-live` region.
- Web Share is optional progressive enhancement; clipboard fallback remains available.
- No account, tracker, cookie, or third-party script is introduced.

## Interaction grammar

- **Tap or Enter/Space:** select or pin a mark.
- **Second tap or explicit “Inspect evidence”:** open evidence detail.
- **Drag:** optional timeline scrubber or spatial exploration; never required to expose content.
- **Swipe:** never required for loading, chapter discovery, or the next research claim.
- **Hover:** may preview on desktop, but cannot be the only source of a label, note, or state.
- **Touch target:** approximately 44 × 44 CSS px or larger, including chip padding and invisible SVG hit areas.
- **Focus:** `:focus-visible` is visually distinct and is not removed.
- **Motion:** under `prefers-reduced-motion: reduce`, auto-rotation, continuous loops, SVG drawing animations, parallax, and smooth scrolling stop. The final static state remains visible.

## Performance and boundary rules

- Keep the shell and first research answer on the server.
- Send each client island only the series, rows, or nodes it consumes.
- Do not render both a full desktop client figure and a full mobile client figure and merely hide one with CSS if this duplicates large data or Three.js work.
- Render the static/ranked mobile state first. Load optional Three.js or complex desktop enhancement near the viewport and only at a suitable container/viewport width.
- Use a useful static summary as the Suspense fallback.
- Keep Three.js out of routes and initial viewports that do not need it.
- A local table or legacy desktop figure may scroll inside its own labelled region; `html`, `body`, the shell, and the figure frame must not overflow at 320px.

## P0 and P1 delivery boundary

This is the required order, not a claim that the items have already shipped.

### P0

1. Remove Home's required nowrap overflow and expose persistent publication status.
2. Put the project purpose and `/words` access in the first mobile screen/global navigation.
3. Establish the server-rendered word-study entry: H1, question, bounded answer, caveat, coverage, and real anchors.
4. Apply that shell first to Forever without changing research values or conclusions.
5. Replace Forever's mobile “wider screen / rotate” frequency fallback with the real mobile frequency story specified in `mobile-visual-translation-spec.md`.
6. Prevent body overflow at 320px, including fixed inspectors; preserve local desktop figure scrolling only where still necessary.
7. Make all P0 controls keyboard-operable, labelled, focus-visible, touch-sized, and reduced-motion safe.

### P1

1. Add Forever's chapter navigation, reusable figure frame, accessible inspector sheet, data table, and section-copy actions.
2. Translate Forever's constellation, signal field, archive, pressure structure, and 3D doubt figure into vertical mobile readings.
3. Refactor the bottom summary into a research conclusion, related-studies, rights/method, and citation surface.
4. Generalize only the components proven reusable by Forever.
5. Move Depression's shell text out of the top-level client boundary.
6. Add static-first/near-viewport loading for optional Three.js figures.
7. Apply the universal figure contract to the other word studies one figure at a time after evidence review.

### Specified but deliberately not implemented as a blanket change

- No thin query-specific routes.
- No rewrite of every title or description without query/position evidence.
- No generic dictionary answers.
- No universal chart template that erases route-specific research form.
- No new chart/design-system dependency.
- No mobile-only privacy experience is adopted from uncommitted user work.
- No new analytics, tracking, login, or profiling.

## Acceptance and QA plan

The following are release gates; they are not recorded as passed in this document.

| Check | 320×568 | 360×800 | 390×844 | 430×932 | 768×1024 | 1440×900 |
| --- | --- | --- | --- | --- | --- | --- |
| No body-level horizontal overflow | Required | Required | Required | Required | Required | Required |
| One H1 and logical headings | Required | Required | Required | Required | Required | Required |
| Direct answer visible without interaction | Required | Required | Required | Required | Required | Required |
| Chapter/hash links preserve fragments | Required | Required | Required | Required | Required | Required |
| Keyboard and focus-visible states | Required | Required | Required | Required | Required | Required |
| 44px-class touch targets | Required | Required | Required | Required | Required | N/A |
| 200% text zoom without clipped content | Required | Required | Required | Required | Required | Required |
| Reduced-motion static state | Required | Required | Required | Required | Required | Required |
| Inspector Escape/focus restore | Required | Required | Required | Required | Required | Required |
| Desktop poster identity preserved | N/A | N/A | N/A | N/A | Compare | Required |

For each priority route, record screenshots, `document.documentElement.scrollWidth` versus `clientWidth`, accessibility-tree/keyboard observations, console and hydration output, and the exact build commit. A code-derived risk is not a failed runtime metric until tested; conversely, clipping inside a screenshot is not excused because the page technically keeps body width.

## Testable hypotheses

These are hypotheses, not promised outcomes:

- **H-MIA-01:** a server-visible, source-bounded answer and stable query-facing anchors should make the intended landing-page match more explicit and may make more qualified query/page associations possible. Measure query-page impressions and clicks for the canonical page; do not interpret CTR without position data.
- **H-MIA-02:** persistent status, summaries, and a global `/words` link will reduce ambiguity for mobile navigation and may increase qualified transitions into published studies. Validate with crawlable-link checks and, only if an approved privacy-preserving first-party measure exists, aggregate navigation counts.
- **H-MIA-03:** a real mobile frequency view is expected to improve post-click usefulness relative to an orientation refusal. Validate through mobile QA, optional consent-free aggregate feedback, citation/referrer evidence, and GSC mobile query/page trends; it does not itself prove ranking improvement.
- **H-MIA-04:** stable figure links and citation actions may improve sharing and citation potential. Measure discovered backlinks, referring pages, and copied-link functionality; do not claim that a copy action caused a backlink.

Because the supplied GSC screenshots contain no average-position data, they cannot distinguish low ranking from low CTR at a competitive position. This IA therefore addresses observable content and usability gaps while leaving ranking/CTR diagnosis conditional on a future export with position.

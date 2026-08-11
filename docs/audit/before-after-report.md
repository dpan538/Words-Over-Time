# Before/after report: search entry, mobile research reader, and route payloads

> **Historical verification report, not current mobile design governance.** Its prior mobile reading order, reusable-shell conclusions, always-visible answer/caveat treatment, and implemented figure scope are superseded for future design work by [`docs/design/mobile/words-over-time-mobile-design-governance.md`](../design/mobile/words-over-time-mobile-design-governance.md). The measurements remain historical evidence only and must not be used to impose desktop parity, limit new mobile analysis, bypass predesign approval, or reject the canonical swipe/accordion card system.

**Report date:** 2026-08-09 (Australia/Brisbane)

**Repository:** `dpan538/Words-Over-Time`

**Branch:** `audit/mobile-search-growth-2026-08`

**Baseline source HEAD:** `e9ee61e57294bb99fc4594a1b53b75935a244b53`

**Baseline artifact:** `qNFv9jd8q4QZPP2pTUjr6`

**Measured after artifact:** `EO9j2G4AzAu8Xfjy287UM`

**Final source HEAD:** `4d777597487062c23c9a75f65470ac6e7760abe1` (eight source commits after baseline)
**Final status:** `PARTIAL_WITH_EVIDENCE`

## Executive summary

The implementation materially improved the part of the project with the clearest verified performance and mobile-usefulness defect: `/words/forever`. In the final production artifact, Forever's raw HTML fell by 634,213 bytes (40.202%), raw RSC/Flight by 608,556 bytes (55.077%), and referenced initial JavaScript by 560,499 bytes (41.927%). Its estimated constructed client JSON fell from 1,085,004 to 455,827 bytes (57.988%). The final viewport matrix also shows a real Forever mobile frequency reader from 320 through 768px and the full desktop visualization at 1440px; the prior “requires a wider screen” refusal was absent.

The work also establishes a reusable server-rendered word-study entry, source-bounded direct answers, stable chapter anchors, visible evidence coverage and caveats, a mobile-first Home/index treatment, a `/words` navigation link, and citation/section-sharing actions. These are implementation and discoverability hypotheses—not claims of ranking, CTR, traffic, backlink, or Core Web Vitals improvement.

The final build and requested verification command passed, but the status is not `COMPLETE` for three evidence reasons:

1. Lighthouse-compatible collection failed in all three available launch paths, so LCP, CLS, TBT, Speed Index, transferred bytes, total request count and long-task results are unknown.
2. A fresh `/words/forever` production tab reproducibly logs one React minified hydration error `#418`. The route remains interactive in the tested flow and no error overlay appears, but the explicit “no hydration errors” target failed.
3. Artificial still has 11 visible controls below the approximately 44px audit threshold at 320px, and full reduced-motion, screen-reader and 200% text-zoom regression checks remain follow-up manual QA.

## What was already correct and was not duplicated

The repository already had route-specific metadata, canonical URLs, a canonical-only sitemap, robots, RSS, `llms.txt`, route-specific Open Graph/Twitter images, a `/words` index, per-route search intents, a bottom `WordSeoSummary`, and substantial `WebSite`, `Person`, `DefinedTerm`, `Article`/`CreativeWork`, `Dataset`, and breadcrumb JSON-LD.

Accordingly, this change set did not:

- add meta keywords;
- create a second sitemap, feed, robots, social-image, or schema system;
- rewrite every title after the 2026-07-28 search release annotation;
- add FAQPage merely to pursue rich-result eligibility;
- treat the project DOI as a distinct identifier for every route-level dataset;
- expose downloadable research material without a verified distribution right.

## Verified baseline problems and after state

| Area | Verified before | Measured/captured after | Status |
| --- | --- | --- | --- |
| Home narrow-screen layout | `scrollWidth` was 413px at 320, 360 and 390px | `scrollWidth` equals viewport width in all six Home rows, including 320px | Verified repaired |
| Primary navigation | Browser baseline exposed only `/` and `/about` | Final matrix exposes `/`, `/words`, and `/about` | Verified in 36 rows |
| Home status/context | Available/coming-soon meaning depended on hover | Status and short study context are visible in the final source and screenshots | Verified initial render |
| Word-page first screen | Query-facing answers were not consistently near the top in server markup | Direct answer visible on Forever, Privacy, Artificial and Hub across their final viewport rows | Verified |
| Forever mobile frequency | Orientation/desktop refusal visible at 320, 360, 390 and 430px | Mobile reader visible at 320, 360, 390, 430 and 768; desktop figure visible at 1440; refusal absent | Verified in measured build |
| Forever payload | 1,577,554 HTML; 1,104,912 RSC; 1,336,840 referenced JS bytes | 943,341 HTML; 496,356 RSC; 776,341 referenced JS bytes | Materially reduced |
| Forever initial Three.js | Optional Three.js entered the baseline client graph | No scanned Three.js signature in Forever's initial asset list | Verified bundle-membership result |
| About heading | Two H1 elements in the baseline source/prerender audit | Second methodology heading changed to H2; final build succeeded | Implemented |
| Semantic figure wrapper | Baseline 320px Forever reported no `figure` or `figcaption` | Final matrix reports 3 figures and 3 figcaptions at every Forever viewport | Verified |
| Body containment | Baseline Home and Artificial overflowed at 320px | All 36 final rows report no horizontal body/root overflow at 320–1440px | Verified repaired |
| Small visible controls | Baseline 320px flags: Home 2, Words 2, Forever 7, Privacy 9, Artificial 23, Hub 13 | Final 320px flags: Home 0, Words 0, Forever 0, Privacy 0, Artificial 11, Hub 0 | Improved; Artificial remains open |

The final audit contains 36 rows: Home, Words, Forever, Privacy, Artificial and Hub at all six requested viewports. Every row reports one H1, one main landmark, no horizontal overflow, no duplicate IDs, no unnamed visible buttons, no visible error overlay, and no wider-screen fallback. Console evidence is assessed separately: `/words` logged no messages in a fresh tab, while Forever reproducibly logged React hydration error `#418`.

## Exact production-artifact payload comparison

These are raw build artifacts on disk. They are not compressed transfer sizes and do not stand in for Lighthouse/network measurements. “JS requests” means unique JavaScript URLs referenced by the route HTML, not total page requests. The after artifact referenced one 79,256-byte raw CSS file on each measured route; a comparable baseline CSS byte value was not recorded, so no CSS delta is claimed.

| Route | HTML before | HTML after | Δ HTML | RSC before | RSC after | Δ RSC | Initial JS before | Initial JS after | Δ JS | JS req. before→after |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 40,065 | 57,625 | +17,560 (+43.829%) | 20,849 | 29,747 | +8,898 (+42.678%) | 670,246 | 670,393 | +147 (+0.022%) | 11→12 |
| `/words` | 41,726 | 43,460 | +1,734 (+4.156%) | 22,015 | 22,842 | +827 (+3.757%) | 670,246 | 670,393 | +147 (+0.022%) | 11→12 |
| `/about` | 168,702 | 170,406 | +1,704 (+1.010%) | 82,980 | 83,817 | +837 (+1.009%) | 677,141 | 677,288 | +147 (+0.022%) | 11→12 |
| `/words/forever` | 1,577,554 | 943,341 | **−634,213 (−40.202%)** | 1,104,912 | 496,356 | **−608,556 (−55.077%)** | 1,336,840 | 776,341 | **−560,499 (−41.927%)** | 13→13 |
| `/words/privacy` | 1,478,587 | 1,502,483 | +23,896 (+1.616%) | 337,119 | 348,815 | +11,696 (+3.469%) | 1,007,041 | 1,009,182 | +2,141 (+0.213%) | 12→13 |
| `/words/artificial` | 171,898 | 197,500 | +25,602 (+14.894%) | 30,266 | 42,716 | +12,450 (+41.135%) | 1,424,821 | 1,427,050 | +2,229 (+0.156%) | 13→14 |
| `/words/hub` | 439,658 | 465,210 | +25,552 (+5.812%) | 147,699 | 160,011 | +12,312 (+8.336%) | 1,330,183 | 1,332,461 | +2,278 (+0.171%) | 13→14 |
| `/words/depression` | 1,715,718 | 1,744,705 | +28,987 (+1.689%) | 1,319,717 | 1,335,451 | +15,734 (+1.192%) | 820,384 | 820,224 | −160 (−0.020%) | 12→13 |
| `/words/data` | 427,771 | 452,597 | +24,826 (+5.804%) | 148,070 | 160,384 | +12,314 (+8.316%) | 746,339 | 748,364 | +2,025 (+0.271%) | 12→13 |

The strict target “no initial-JS regression on any audited route” was therefore **not met**. Seven routes increased by 147–2,278 raw referenced JS bytes; Depression decreased by 160 bytes and Forever decreased by 560,499 bytes. The added server-rendered study entry also deliberately increases HTML/RSC on most pages. That trade is reported, not hidden: useful source-bounded text is now present in the initial document, while Forever's oversized client payload was separately reduced.

### Forever serialized-data detail

| Measure | Before/full source | After client projection | Difference |
| --- | ---: | ---: | ---: |
| Constructed client JSON estimate | 1,085,004 | 455,827 | −629,177 (−57.988%) |
| Full generated dataset vs explicit client dataset | 1,142,920 | 455,827 | −687,093 (−60.117%) |
| Inspector payload estimate | 738,779 | 149,346 | −589,433 |
| Inspector records | 482 source records | 313 retained summaries | 169 records not sent to this client projection |

The route projection keeps only browser-used slices and compact inspector summaries. Raw research caches, source records, and measured values were not changed. JSON byte estimates are not compressed network transfer sizes; the raw RSC delta is the artifact-level corroboration.

## Laboratory timing and transfer results

| Metric | Home | Words | Forever | Privacy | Artificial | Hub |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| LCP | `null` | `null` | `null` | `null` | `null` | `null` |
| CLS | `null` | `null` | `null` | `null` | `null` | `null` |
| TBT | `null` | `null` | `null` | `null` | `null` | `null` |
| Speed Index | `null` | `null` | `null` | `null` | `null` | `null` |
| Total request count | `null` | `null` | `null` | `null` | `null` | `null` |
| Transferred bytes | `null` | `null` | `null` | `null` | `null` | `null` |
| Image bytes | `null` | `null` | `null` | `null` | `null` | `null` |
| Long tasks | `null` | `null` | `null` | `null` | `null` | `null` |

No zero or estimate is substituted. The exact collection failures were:

1. sandboxed `npx` acquisition: `ENOTFOUND registry.npmjs.org`;
2. system Chrome explicit-path launch: Crashpad lock and `ECONNREFUSED 127.0.0.1`;
3. Playwright headless shell: `Unable to connect to Chrome`.

Consequently, the targets CLS ≤0.1, Home mobile LCP ≤2.5s, word-page mobile LCP ≤3.0s, and Home TBT ≤200ms are **unassessed**, not passed or failed.

## Build and reproducibility evidence

`npm run verify` completed with exit code 0 at source HEAD `4d777597487062c23c9a75f65470ac6e7760abe1` and produced build `EO9j2G4AzAu8Xfjy287UM`. Compilation took approximately 4.5 minutes, Next's internal TypeScript phase approximately 18.0 minutes, page-data collection 30.9 seconds, and static generation completed 31/31 pages in 83 seconds. Data validation reported 46 terms, 27 sources, 29 evidence records, 37 relations and 0 warnings. These timings describe build reproducibility in this environment, not page speed.

The build also discovered the pre-existing untracked `/words/privacy/mobile-demo` route. That route and `src/components/privacy/PrivacyMobileExperience.tsx` belong to the user, were not adopted by this audit, and remain a release-scope risk because an untracked route can enter a local production build.

## Search and query-to-page findings

No GSC CSV existed under `docs/audit/input/`, and the supplied screenshots omit average position. The query matrix therefore preserves `average_position=unknown` and does not diagnose zero clicks as a snippet failure.

The strongest visible query clusters support canonical-section work rather than thin pages:

- Forever: spelling, one-word/two-word form, study-bounded meaning, origin/etymology, semantic change, and digital permanence; stable entries include `#spelling`, `#origin`, `#meaning-over-time`, and `#spelling-frequency`.
- Privacy: etymology/root-family evidence, historical meaning, legal/data protection context, and surveillance/governance, with explicit jurisdiction and attestation caveats.
- Artificial: art/skill/contrivance and made/imitated senses before the AI-era branch; the implementation avoids the unsupported simplification “originally meant fake.”
- Hub: wheel-center evidence to transport/network metaphor, while leaving ultimate origin uncertain.
- Data and Depression: evidence-led clusters remain hypotheses because no visible query demand was supplied; Depression is lexical research, not medical advice.

## Testable hypotheses and measurement boundary

| Intended effect | Hypothesis | Test | Boundary |
| --- | --- | --- | --- |
| Qualified impressions | Server-visible source-bounded answers and stable anchors may clarify query-page relevance | Compare exact query × page impressions 28 and 56 days after release | Interpret with position; do not reward unqualified generic impressions by default |
| CTR | Better first-screen alignment for spelling/etymology may improve qualified clicks at comparable positions | Compare CTR inside stable position bands by device | If rank mix changes, CTR comparison is not causal |
| Post-click usefulness | A real mobile frequency reader may be more useful than an orientation refusal | 320–430 functional QA, table/equivalent-text access, evidence actions, qualitative review | Does not prove ranking or traffic growth |
| Sharing/backlinks | Stable section URLs and accurate citation/copy actions may make figures easier to cite | Functional copy/share QA; later inspect discovered links/referrers | A copy action does not prove a backlink |
| Performance | Trimming Forever client data may improve loading/responsiveness | Comparable Lighthouse/transfer test on the deployed build | Raw artifact reductions alone do not prove LCP/TBT improvement |

## Mobile redesign logic

The new system keeps the wheat field, black editorial rules, oversized type, route colors, and flat poster language. It changes the mobile reading order rather than scaling a 1320px poster:

1. word and direct source-bounded answer;
2. related questions and stable chapter links;
3. coverage/evidence/caveat strip;
4. focused figure state;
5. visible interpretation and evidence action;
6. next chapter, archive, related studies, citation and sharing.

Forever is the implemented proving route. Its mobile frequency figure selects one series, provides visible scale/coverage/first/recent/highest-plotted context, states that frequency is not first attestation, works without hover or landscape orientation, and retains the full desktop figure at wide viewports. Other routes have transformation specifications but were deliberately not forced into an identical chart system.

## Desktop regression status

The required after set contains 1440×900 PNGs for Home, Words, Forever, Privacy, Artificial and Hub. The final browser audit found one H1, one main landmark, no horizontal overflow, no duplicate IDs, no unnamed visible buttons, no visible error overlay, and no wider-screen fallback on all six routes at 1440px. Forever's desktop frequency visualization was visible at 1440px.

The screenshots record initial render before the last keyboard-only source change; the final keyboard behavior was tested independently against build `EO9j2G4AzAu8Xfjy287UM`. Desktop initial-layout regression evidence passes the recorded checks, but interaction-by-interaction visual equivalence remains a manual review boundary. Artificial and Hub still include Three.js in their initial asset lists; Home and Forever do not. The four signature chunks are `01lh76562hwdt.js`, `0l2ma5ud3efxp.js`, `0okk8gdb0qe8x.js`, and `0xmo~ty939d0p.js`.

## Accessibility status

Verified or implemented:

- the final audit reports one H1 and one main landmark on all 36 rows;
- no horizontal overflow, duplicate IDs or unnamed visible buttons were reported in those rows;
- direct answers and caveats are visible rather than accordion-gated;
- Forever reports semantic `figure`/`figcaption` wrappers;
- the mobile frequency controls and key shared actions were enlarged and given focus-visible states;
- the Forever inspector implements dialog semantics when open, Escape close, focus trapping and focus restoration;
- reduced-motion handling is present in the new interaction layer.

Still open:

- Artificial still has 11 visible controls under the approximately 44px audit threshold at 320px; Home, Words, Forever, Privacy and Hub report zero;
- a fresh Forever production tab reproducibly logs React minified hydration error `#418`, so the no-hydration-error target fails even though the route's tested interaction works;
- 200% text zoom, full screen-reader naming, sheet focus restoration, reduced-motion behavior and safe-area coverage remain follow-up manual QA.

The final Forever interaction check at 390px preserved `#spelling-frequency`, found the slider at DOM value 322/year 2022, and after `ArrowLeft` exposed the accessible snapshot “Inspect year 2021.” It opened one yearly table with 323 rows and the exact caption “Every plotted yearly Google Books Ngram value for forever, 1700 to 2022”; body and client widths both remained 390px. The table is progressively disclosed, explaining why the initial-render matrix counts zero tables.

## Changed-file groups

The implementation is concentrated in these files/groups:

- server research entry: `src/data/search-intents.ts`, `src/components/WordPageShell.tsx`, `SearchIntentSummary.tsx`, `EvidenceCoverageStrip.tsx`, `MobileChapterNav.tsx`, `WordSeoSummary.tsx`, and all six canonical word `page.tsx` files;
- poster shell integration: `ForeverPoster.tsx`, `PrivacyPoster.tsx`, `ArtificialPoster.tsx`, `HubPoster.tsx`, `DataPoster.tsx`, and `DepressionPoster.tsx`;
- Home/index/navigation: `src/app/page.tsx`, `src/app/about/page.tsx`, `Nav.tsx`, `WordList.tsx`, and `WordCard.tsx`;
- Forever mobile/performance/accessibility: `MobileFrequencyStory.tsx`, `FrequencyTimeline.tsx`, `DeferredForeverFigures.tsx`, `MiniInspectorMenu.tsx`, `ForeverInstitutionalDoubt.tsx`, `FigureShareActions.tsx`, `CitationAndSharing.tsx`, `src/types/foreverRealData.ts`, and `src/types/inspector.ts`;
- narrow-screen containment fixes: the route-specific Artificial, Hub and Privacy chart components;
- audit evidence: `docs/audit/` route inventory, bundle baseline, query matrix/template, IA/specs, performance JSON, before/after screenshots, canonical report, implementation plan, and final audit report.

The pre-existing deleted Privacy research-cache file and the two untracked Privacy mobile-demo paths are excluded from this work.

## Expected effect categories—not forecasts

| Change | Qualified impressions | CTR | Post-click usefulness | Sharing/backlinks |
| --- | --- | --- | --- | --- |
| Server-visible answers and stable anchors | Hypothesis: clearer query/page relevance | Hypothesis at comparable rank | Faster orientation | Easier section citation |
| `/words` navigation and visible study status | Possible better crawl/discovery path | No direct claim | Clearer site navigation | Indirect only |
| Forever mobile frequency reader | No direct ranking claim | No direct claim | Strongest expected benefit | Figure/section links become shareable |
| Citation and Web Share/copy fallbacks | No direct claim | No direct claim | Easier source reuse | Hypothesis: lower citation friction |
| Forever payload reduction | No direct claim | No direct claim | Possible loading/responsiveness benefit; lab effect remains unmeasured | Indirect only |

No row guarantees growth. The measured results establish implementation and payload changes only.

## 28-day and 56-day GSC plan

Use the deployment date as a new release annotation, while retaining 2026-07-28 as the prior search release.

At day 0:

- export query × page × device × date with clicks, impressions, CTR and average position;
- preserve brand/non-brand and qualified/unqualified query labels;
- record deployment hash/build and any indexing request separately;
- do not merge screenshot totals across dimensions.

At day 28:

- compare Forever spelling/origin/meaning, Privacy etymology, Artificial meaning/made-by-artificial-means, Hub etymology, and site-level word-usage clusters;
- segment mobile and desktop;
- compare impressions and CTR only inside comparable position bands;
- inspect unexpected query-page pairings and generic impressions for intent mismatch;
- review coverage/index status, not just clicks;
- treat low samples as directional, not conclusive.

At day 56:

- repeat the same export and bands;
- compare both the immediate 28-day window and cumulative 56-day window against a seasonally reasonable pre-release baseline;
- decide per hypothesis: retain, refine, or revert;
- preserve conclusions if new copy would require evidence the project does not have;
- investigate separately whether changes reflect ranking, CTR at stable rank, or different query mix.

Minimum interpretation rules:

- impressions up with position stable/improving may support discovery relevance;
- CTR change is interpretable only with position and device controlled;
- zero clicks alone does not prove a poor snippet;
- a broader but less qualified query mix is not automatically a win;
- GSC cannot validate internal navigation, interaction usability, or citation completion by itself.

## Deliberately not implemented

- no thin page for each spelling, definition, etymology, legal, or AI query;
- no generic dictionary definitions generated from model memory;
- no broad title rewrite without position-controlled evidence;
- no meta-keywords strategy or schema added for quantity;
- no FAQPage promise or rich-result claim;
- no route-level DOI/dataset identifier copied without factual modeling;
- no `distribution` field or public raw-data download without rights evidence;
- no change to research values, caches, conclusions, licensing, or restricted evidence;
- no third-party chart/design-system dependency for the mobile frequency figure;
- no advertising tracker, cookie analytics, login, profiling, or unnecessary third-party script;
- no forced universal mobile chart template across semantically different word studies;
- no claim that Artificial/Hub Three.js deferral is complete;
- no invented Lighthouse values, average position, ranking gain, traffic gain, CTR gain, backlink, or user-engagement result.

## Remaining risks and follow-up

1. Diagnose and repair Forever's reproducible React hydration error `#418`, then repeat the fresh-tab production console test without weakening server-rendered content.
2. Collect Lighthouse or equivalent in an environment that can launch/connect to Chrome; keep current LCP, CLS, TBT and Speed Index values null until then.
3. Review Artificial's 11 sub-44px visible controls at 320px and enlarge those that are interactive without distorting the research figure.
4. Complete manual copy/share fallback, inspector focus restoration, reduced-motion, screen-reader and 200% text-zoom checks.
5. Audit Artificial and Hub Three.js/initial JS as a separate P1; do not erase the research visuals to manufacture a pass.
6. Resolve whether the user-owned untracked `/words/privacy/mobile-demo` route belongs in the release before deployment.
7. Treat the older Forever institutional/platform interpretation as an evidence gap unless current corpus evidence supports it; the new summary does not promote it as an established corpus finding.

The machine-readable counterpart to this report is `docs/audit/performance-after.json`; the full baseline is `docs/audit/performance-baseline.json`.

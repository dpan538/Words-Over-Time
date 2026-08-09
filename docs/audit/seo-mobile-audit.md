# Search discovery, mobile UX, performance, accessibility, and IA audit

**Audit date:** 2026-08-08; final evidence updated 2026-08-09 (Australia/Brisbane)

**Repository:** `dpan538/Words-Over-Time`

**Production domain:** `https://www.wordsovertime.com/`

**Working branch:** `audit/mobile-search-growth-2026-08`

**Baseline commit:** `e9ee61e57294bb99fc4594a1b53b75935a244b53` (`optimize search discovery and crawl payloads`)

**Final source HEAD:** `4d777597487062c23c9a75f65470ac6e7760abe1` (`fix: support keyboard frequency scrubbing`)

**Final verification build:** `EO9j2G4AzAu8Xfjy287UM`

**Existing search release annotation:** 2026-07-28
**Document status:** `PARTIAL_WITH_EVIDENCE` — high-confidence P0/P1 work, the final production-mode build, `npm run verify`, payload measurement, a 36-row viewport audit, and the Forever keyboard/table flow completed. GSC position data and valid Lighthouse lab runs remain unavailable; live canonical verification is network-blocked; Forever logs React hydration error #418 in a fresh production tab.

## 1. Executive summary

Words Over Time already has a stronger technical discovery foundation than a typical small research publication: route-specific metadata, canonical URLs, sitemap, robots, RSS, `llms.txt`, route social images, a public `/words` index, explicit search-intent records, and substantial source-aware JSON-LD already exist. This audit therefore does **not** recommend another round of basic tags, meta keywords, blanket title rewrites, or schema added for quantity.

The highest-confidence problems are closer to the research experience:

- Home overflowed at 320, 360, and 390px, omitted `/words` from primary navigation, and hid publication status/context behind hover.
- Forever removed its real frequency chart below 640px and told readers to rotate or use desktop.
- Query-facing spelling, etymology, meaning, and grammar answers were represented in metadata/research but were not consistently visible near the top or linked with stable anchors.
- Forever and Depression coupled the whole poster, including the H1, to large client boundaries; their inspected route props exceeded 1MB.
- The baseline `/about` route contained two H1 elements.
- Several figures depended on hover, wide local canvases, or pointer-positioned evidence detail; semantic figure/caption/table alternatives were inconsistent.

Eight scoped commits after the baseline implement the high-confidence P0/P1 work: a server-rendered study shell, evidence-bounded direct answers, mobile Home/primary navigation, a real Forever mobile frequency figure, a reduced Forever client dataset, deferred optional Forever figures, accessible citation/share actions, a keyboard-safe mobile inspector, narrow-screen containment, and deterministic keyboard scrubbing. In final build `EO9j2G4AzAu8Xfjy287UM`, Forever raw HTML fell from 1,577,554 to 943,341 bytes, raw RSC from 1,104,912 to 496,356 bytes, and raw initial JS from 1,336,840 to 776,341 bytes. Those are raw artifact bytes, not compressed transfer or Core Web Vitals.

The work is still partial. A Lighthouse-compatible collection could not produce valid LCP, CLS, TBT, Speed Index, total-transfer, or long-task values after three documented browser/acquisition failures. The strict “no initial-JS regression on every route” target was also missed: raw referenced JS increased by 147 bytes on Home, Words, and About, by 2,141 on Privacy, 2,229 on Artificial, 2,278 on Hub, and 2,025 on Data; Depression fell by 160 bytes and Forever fell by 560,499 bytes. More importantly, a fresh production Forever tab reproducibly logged one React minified hydration error #418, so the no-hydration-error target failed even though the page displayed no visible error overlay. Other dense route-specific mobile visuals remain specified rather than fully translated.

No ranking or traffic improvement is claimed. The supplied GSC screenshots do not include average position or complete query-page rows, so they cannot distinguish low ranking from low CTR at a competitive position. Zero clicks is not evidence by itself that a snippet is poor.

## 2. Scope, baseline, and method

### Repository safety

The audit began on `main` at `e9ee61e57294bb99fc4594a1b53b75935a244b53`, then moved to `audit/mobile-search-growth-2026-08`. Node was `v22.21.0` and npm `10.9.4`.

The following unrelated user changes existed before the audit and were preserved:

- deleted `docs/research/privacy/processed/privacy_geo_spatial_metrics_processed.json`;
- untracked `src/app/words/privacy/mobile-demo/`;
- untracked `src/components/privacy/PrivacyMobileExperience.tsx`.

They are not audit implementation, are not evidence of the canonical Privacy route, and must not be staged with this work.

### Deployment assumptions

- The canonical public origin in code is `https://www.wordsovertime.com`, subject to `NEXT_PUBLIC_SITE_URL` configuration.
- Next.js prerenders the audited public routes in the production build.
- The hosting provider and live hostname redirect rules must be established by the live canonical audit; they are not inferred from framework configuration.
- A local production response verifies the built application, not CDN redirects, edge headers, or production Core Web Vitals.

### Commands and artifacts recorded so far

| Check | Result so far | Evidence boundary |
| --- | --- | --- |
| `git status --short`, current branch, HEAD, log | Recorded; unrelated dirty paths preserved | Repository baseline above |
| `npm ci` | Passed; 116 packages; npm reported four high-severity audit findings | No automatic `npm audit fix` was run |
| `npm run typecheck` | First run failed on stale/corrupted `.next/dev/types` generated declarations | Not treated as a source TypeScript failure |
| clean `npx tsc --noEmit --pretty false --incremental false` | Passed | Established that the initial failure was stale generated output |
| `npm run build` baseline | Passed | Build also surfaced the user-owned untracked `/words/privacy/mobile-demo` as a public route; this is a release-scope risk, not audit code |
| `npx next experimental-analyze --output` | Passed after the sandbox's initial port-binding `EPERM` limitation | Baseline artifacts saved in `docs/audit/bundle-baseline/` |
| local production browser matrix | 36 before PNGs and 36 required after PNGs; final after audit contains 36 DOM rows | Six routes × six requested viewports; every row reports no body overflow, one H1, one main, no duplicate IDs, no unnamed visible buttons, no visible error overlay, and no wider-screen fallback |
| screenshot provenance | The 36 required after PNGs record the initial render from the successful build immediately before the final keyboard-only source change | They are not described as post-keyboard screenshots. Final-build functional proof comes from the separate Forever 390px hash/slider/table check |
| production console | Fresh `/words`: `[]`; fresh `/words/forever`: one React minified error #418 | No visible overlay is not equivalent to hydration success; no-hydration-error target failed |
| Lighthouse/equivalent performance audit | **Unavailable after three recorded attempts** | Sandbox package acquisition: `ENOTFOUND registry.npmjs.org`; system Chrome: Crashpad lock plus `ECONNREFUSED 127.0.0.1`; Playwright shell: `Unable to connect to Chrome`. No LCP, CLS, TBT, or Speed Index value is inferred |
| final `npm run verify` | Passed with exit code 0; build ID `EO9j2G4AzAu8Xfjy287UM` | Compile approximately 4.5 min; internal Next TypeScript approximately 18.0 min; page-data collection 30.9s; static generation 31/31 in 83s |
| dataset validation inside `verify` | Passed | 46 terms, 27 sources, 29 evidence records, 37 relations, 0 warnings |

### Audited routes

`/`, `/words`, `/about`, `/words/forever`, `/words/privacy`, `/words/artificial`, `/words/hub`, `/words/depression`, and `/words/data` were inventoried. The browser screenshot matrix currently covers Home, Words, Forever, Privacy, Artificial, and Hub at 320×568, 360×800, 390×844, 430×932, 768×1024, and 1440×900.

Supporting evidence is split by purpose:

- `route-inventory.md` records metadata, H1s, server/client boundaries, first rendered text, internal links, and raw artifact sizes;
- `query-page-matrix.csv` and `gsc-export-template.csv` keep supplied and missing search fields explicit;
- `mobile-information-architecture.md` and `mobile-visual-translation-spec.md` define the reusable reader and route-specific visual contract;
- `screenshots/before/` contains the 36 images, DOM audit JSON, and console capture;
- `bundle-baseline/` contains the baseline Next analyzer output;
- `performance-baseline.json` preserves raw baseline payload and explicit null lab fields;
- `screenshots/after/` contains the 36 required after images and the 36-row browser audit; the image set predates only the final keyboard-handler change, whose behavior was verified separately against the final build;
- `canonical-and-indexing-audit.md` is complete as a scoped sub-audit with `BLOCKED_WITH_EVIDENCE`: sandbox DNS yielded no usable production response, verified no production P0 defect, and left all live status/redirect/canonical fields unknown;
- `performance-after.json` and `before-after-report.md` contain the machine-readable and narrative final measurement evidence.

### GSC limitation

No CSV export existed under `docs/audit/input/`. `docs/audit/gsc-export-template.csv` has been created, and `docs/audit/query-page-matrix.csv` uses only the supplied screenshot values. Average position, query clicks, query CTR, country rows, and query-page pairing remain `unknown` unless explicitly supplied.

## 3. Supplied GSC baseline

The supplied screenshots cover their most recent three-month range. The tables below are independent screenshot transcriptions. They should not be forced into one total because the screenshots may use different dimensions, privacy thresholds, or visible-row limits.

### Device

| Device | Impressions | Clicks | CTR |
| --- | ---: | ---: | ---: |
| Mobile | 390 | 4 | approximately 1.03% |
| Desktop | 718 | 0 | 0% in the supplied view |
| Tablet | 14 | 0 | 0% in the supplied view |

Average position is unavailable. Desktop zero clicks therefore cannot be diagnosed as a CTR defect.

### Top pages

| Page | Impressions | Clicks |
| --- | ---: | ---: |
| `/` | 96 | 3 |
| `/words/privacy` | 186 | 1 |
| `/words/forever` | 385 | 0 |
| `/words/artificial` | 247 | 0 |
| `/words/hub` | 196 | 0 |
| `/about` | 40 | 0 |
| `/words/depression` | 31 | 0 |

These rows show discovery, not cause. Without query-page position, a zero-click page may be low-ranking, shown for weakly matched intent, or simply observed too little at competitive positions.

### Visible queries

| Query | Impressions | Query clicks | Average position |
| --- | ---: | --- | --- |
| `forever spelling` | 63 | unknown | unknown |
| `privacy etymology` | 50 | unknown | unknown |
| `spell forever` | 44 | unknown | unknown |
| `what is the meaning of the word forever?` | 31 | unknown | unknown |
| `artificial` | 31 | unknown | unknown |
| `forever etymology` | 18 | unknown | unknown |
| `hub etymology` | 15 | unknown | unknown |
| `created by artificial means` | 15 | unknown | unknown |
| `artificial meaning` | 15 | unknown | unknown |
| `word usage over time` | 14 | unknown | unknown |

The 40-row query-page matrix expands these visible rows into research-safe clusters and known gaps: 7 P0, 28 P1, and 5 P2 hypotheses. It does not invent demand for rows absent from GSC.

## 4. What was already correct and was not duplicated

The following were already present before this audit:

- route-specific titles and meta descriptions;
- canonical URLs generated from the configured `www` origin;
- Open Graph and Twitter metadata;
- route-specific social-image routes;
- sitemap and robots routes;
- RSS feed and `llms.txt`;
- public word index at `/words`;
- per-route search-intent arrays;
- a bottom `WordSeoSummary` with related-study and methodology links;
- `WebSite`, `Person`, `DefinedTermSet`/`CollectionPage`, `BreadcrumbList`, `DefinedTerm`, `Article`/`CreativeWork`, and `Dataset` JSON-LD as appropriate;
- source, access, licensing pointer, creator/publisher, keywords, related page/term, and measurement-technique fields on Dataset nodes.

The implementation deliberately reuses and restructures these systems. It does not add meta keywords, duplicate sitemap/schema routes, add FAQPage for rich-result speculation, or rewrite every title after the 2026-07-28 release without position-controlled evidence.

Dataset fields still requiring factual modeling include `identifier`, `version`, `temporalCoverage`, `isBasedOn`, `sameAs`, `variableMeasured`, and `distribution`. Their absence is not repaired by copying a project DOI or exposing rights-restricted downloads.

## 5. Verified technical and content-delivery problems

| Finding | Evidence | Diagnostic class | Priority | Current status |
| --- | --- | --- | --- | --- |
| Home overflow at narrow widths | 320: `413/320`; 360: `413/360`; 390: `413/390` scroll/client width | Mobile usability | P0 | Final 36-row audit reports equal client/scroll width at all six Home viewports |
| Artificial overflow at 320 | `337/320` scroll/client width | Mobile usability | P0/P1 | Final 36-row audit reports no body overflow at 320–1440px; 11 visible Artificial controls remain below 44px at 320px |
| `/words` absent from primary nav | Baseline browser links were `/` and `/about` | IA/crawlable navigation | P0 | Implemented in `6a13426`; final DOM audit exposes `/`, `/words`, and `/about` |
| Home research/status labels hover-only | Source and screenshots | Mobile/post-click orientation | P0 | Implemented in `6a13426`; available/coming-soon state is ordinary visible mobile text |
| Forever mobile frequency refusal | Visible at 320, 360, 390, 430; absent at 768/1440 | Mobile usefulness | P0 | Replaced in `6f330b8`; final 390px test preserved the hash, moved the slider from 2022 to 2021 with ArrowLeft, exposed a 323-row captioned table, and kept body width at 390px |
| Direct answer/anchor gap | Metadata names intents; first server-text excerpts are broad poster theses | Query-intent/first-screen match | P0/P1 | Shared Server Component shell implemented in `aaa6016`; 18 short answers received a source-boundary review in `ecccefd` |
| `/about` two H1 elements | Route inventory/source inspection | Accessibility/heading hierarchy | P0 | Second H1 changed to H2 in `6a13426`; final raw artifact reflects the fix |
| Forever client serialization | About 1,085,004 JSON prop bytes; inspectors about 738,779 bytes | Performance architecture | P1 | Measured client projection is 455,827 bytes, down 629,177 bytes (58.0%); final RSC is 496,356 bytes |
| Depression client serialization | About 1,299,132 JSON prop bytes | Performance architecture | P1 | Not materially reduced in this scope; final RSC rose from 1,319,717 to 1,335,451 bytes as server-visible entry markup was added, so route slicing remains P1 debt |
| Optional Three.js in initial client graphs | Forever/Artificial/Hub source and bundle inventory | Performance architecture | P1 | Forever optional figures are deferred with useful static fallbacks and its measured initial asset list contains no Three.js chunk; Artificial and Hub remain P1 debt |
| Small controls | Baseline 320px counts: Home 2, Words 2, Forever 7, Privacy 9, Artificial 23, Hub 13 | Accessibility/mobile | P0/P1 | Final audit: Home 0, Words 0, Forever 0, Privacy 0, Artificial 11, Hub 0; Artificial remains P1 debt |
| Missing semantic figure contract | At 320, audited routes reported 0 `figure`, 0 `figcaption`, and 0 tables despite SVG/canvas research views | Accessibility/citation | P1 | Forever frequency now supplies figure, caption, summary, source/caveat, SVG semantics, full table, and section-link actions; other figures remain route-specific debt |
| Fixed pointer-positioned inspector | Source inspection found no dialog, Escape, focus trap/restore | Accessibility/mobile | P1 | Bottom-sheet/dialog behavior, Escape, Tab trap, and focus restoration are implemented; full screen-reader/zoom coverage remains a manual follow-up |

The final 36-row browser matrix reports one H1, one main, no duplicate IDs, no unnamed visible buttons, no visible error overlay, no wider-screen fallback, and no body overflow on every audited route/viewport. This DOM result does not override the fresh Forever console result: React minified error #418 is a verified hydration mismatch, so the hydration target failed.

## 6. What cannot yet be diagnosed

| Possible diagnosis | Current evidence | Required evidence |
| --- | --- | --- |
| Low ranking | Unknown | GSC average position by exact query × page × device |
| Low CTR at a competitive position | Unknown | Stable/comparable position bands plus clicks/impressions |
| Poor snippets | Not established | SERP observation plus position-controlled CTR test; zero clicks alone is insufficient |
| Query-intent mismatch | Plausible for generic definitions; verified first-screen answer gaps | Query-page export, SERP context, and post-click behavior/qualitative review |
| Weak first screen | Verified for Home and multiple word-query answers | After screenshots and raw server text to confirm repair |
| Mobile usability problem | Verified for Home overflow and Forever refusal | After viewport/interaction matrix to quantify repair |
| Performance problem affecting users | Architecture/payload risk verified; lab/user impact unknown | Comparable Lighthouse/equivalent and, if available, field CWV |

This separation matters: the implementation repairs observable landing-page and mobile defects, but it does not label every zero-click row a snippet problem.

## 7. Query-to-page findings

### Forever

The visible spelling/meaning/etymology queries account for 156 listed impressions: 63 `forever spelling`, 44 `spell forever`, 31 the meaning question, and 18 `forever etymology`. The title is already aligned and should not be repeatedly rewritten.

The verified gap was answer placement and addressability:

- spelling variants were visualized but not directly answered at `#spelling`;
- origin evidence was in the archive but not summarized with its secondary-source confidence boundary;
- a generic meaning query could be misled by dictionary-style copy, so the answer must explicitly describe what **this study** supports;
- frequency cannot establish spelling prescription, origin, or first attestation.

Canonical solution: one Forever page with stable `#spelling`, `#origin`, and `#meaning-over-time` entries, plus existing research-section anchors. No spelling query subpages.

### Privacy

`privacy etymology` has 50 listed impressions. The current title is already directly aligned. The evidence layer has related root-family material, but the matrix records zero high-confidence, 27 medium-confidence, and five low-confidence records. A safe answer must distinguish `privacy` from older `private`/`privy` evidence and must not manufacture a definitive first date.

Additional canonical anchors serve historical meaning, legal/data meaning, and surveillance/governance without presenting a universal legal definition. Country and jurisdiction must be included in any legal interpretation.

### Artificial

The visible rows are `artificial` (31), `created by artificial means` (15), and `artificial meaning` (15). A broad term query may not be qualified for this research project. The evidence-backed opportunity is to make the historical scope explicit:

- early evidence associates artificial with art, skill, contrivance, and making;
- the study should not claim the word simply “originally meant fake”;
- an AI-era branch is later context, not a license to publish a generic AI definition or unsupported coinage history.

The canonical page should answer these within `#original-meaning` and `#created-by-artificial-means`, with a clear route scope.

### Hub

`hub etymology` has 15 listed impressions. The title is aligned, but the ultimate origin is uncertain. Public-source claims, directly supported records, and corpus snippets must remain distinct. The wheel-center sense can be described as the earliest supported sense in this research layer; it should not become an unqualified ultimate-origin claim.

Stable `#origin` and `#wheel-to-network` sections are more defensible than a new etymology page.

### Data and Depression

No visible GSC query values were supplied for these clusters. The matrix therefore treats them as evidence-led opportunities, not proven demand:

- Data: datum/data relationship, singular/plural usage, etymology, governance, and AI-era material.
- Depression: physical loweredness, weather, economy, clinical use, and semantic branching.

The Depression clinical entry requires the strongest intent boundary: it is lexical/design research, not medical advice, diagnosis, or a clinical definition.

### Site-level discovery

`word usage over time` has 14 listed impressions. Home already names the research areas, but its explanatory H1 was visually late and `/words` was not in primary navigation. The intervention is a compact source-led first screen and crawlable index link, not a generic SEO paragraph or keyword list.

## 8. Testable search and usefulness hypotheses

| ID | Intended effect | Hypothesis | Primary measure | Guardrail/confounder |
| --- | --- | --- | --- | --- |
| H-IMP-01 | Qualified impressions | Server-visible, evidence-bounded answers and stable anchors may make intended query-page relationships clearer | Exact query × canonical page impressions at 28/56 days | Interpret alongside position; reject generic/unqualified query growth as success by default |
| H-CTR-01 | Organic clicks/CTR | At comparable positions, a first-screen answer matching spelling/etymology intent may improve qualified clicks | Clicks and CTR within comparable position bands by device | No conclusion if ranking distribution changes materially; snippets may not use the new text |
| H-IA-01 | Discovery/post-click | A visible `/words` link and persistent study status may reduce navigation ambiguity | Crawlable links, mobile QA, optionally approved privacy-preserving aggregate navigation | GSC cannot measure internal navigation directly |
| H-MOB-01 | Post-click usefulness | A real one-series mobile frequency figure should be more useful than an orientation refusal | Successful 320–430 QA, table/evidence access, mobile query-page trends | Does not prove ranking change; no invented engagement metric |
| H-PERF-01 | Post-click/performance | Removing unused Forever client data should reduce RSC/serialized payload and may improve lab loading/responsiveness | Comparable raw/transfer RSC, initial JS, LCP, TBT | Same build mode, route, viewport, throttling, and cache state required |
| H-SHARE-01 | Sharing/citation potential | Stable section links and accurate citation actions may make evidence easier to reference | Functional copy/share QA, discovered backlinks/referring pages | A copy action does not prove a backlink or search effect |
| H-A11Y-01 | Usefulness/access | One H1, focus-visible controls, a keyboard range/table, and an accessible inspector should reduce interaction exclusion | Keyboard/screen-reader/zoom/reduced-motion test results | Do not convert automated scores into a complete accessibility claim |

These hypotheses should be release-annotated against the final deployment, not retroactively attributed to the 2026-07-28 search release.

## 9. Mobile redesign logic

The mobile system is an editorial vertical research reader, not a reduced desktop poster and not a generic SaaS dashboard.

The target order is:

1. word and direct, source-bounded answer;
2. related question/section links;
3. evidence coverage and caveat;
4. chapter navigation;
5. one focused, legible figure state;
6. visible interpretation;
7. evidence action;
8. next chapter;
9. source archive;
10. related studies and citation.

The interaction grammar is tap/keyboard to select, second tap or explicit button to inspect, optional drag for a scrubber, and a safe-area-aware sheet for detail. Swipe and hover are never required to discover primary content. P0 controls target approximately 44×44 CSS px, keep visible focus, and preserve a static state under reduced motion.

Home preserves the wheat field, black editorial rules, oversized type, flat composition, and route accents. Mobile rows wrap and expose status; they do not become rounded cards, shadowed tiles, glass panels, or icon-heavy dashboard controls.

Forever proves the reusable visual contract first. Other routes keep route-specific transformation specifications rather than being forced into a universal chart:

- frequency → selected-series line and table;
- constellation → ranked phrases/collocates before optional network;
- radial/pressure structures → vertical historical steps before overview;
- signal field → comparable category strips;
- map → ranked regions before optional map;
- archive → evidence cards and source sheet;
- 3D → static/readable state before optional enhancement.

## 10. Implementation and changed-file scope

The final source implementation is separated into eight commits after the baseline HEAD. A later documentation/evidence commit is intentionally counted separately from these source/audit commits.

| Commit | Scope |
| --- | --- |
| `74a6a7b` | `docs: add SEO and mobile baseline audit` |
| `aaa6016` | `feat: establish server-rendered word study shell` |
| `6a13426` | `feat: make home and navigation mobile-first` |
| `6f330b8` | `feat: replace mobile frequency fallback` |
| `ecccefd` | `fix: tighten source-backed claim boundaries` |
| `e3da304` | `fix: close mobile QA gaps` |
| `eae9aeb` | `fix: contain artificial pressure legend` |
| `4d77759` | `fix: support keyboard frequency scrubbing` |

### Source-bounded entry system

- `src/data/search-intents.ts`
- `src/components/WordPageShell.tsx`
- `src/components/SearchIntentSummary.tsx`
- `src/components/EvidenceCoverageStrip.tsx`
- `src/components/MobileChapterNav.tsx`
- all six `src/app/words/*/page.tsx` route entries
- all six top-level poster shells
- `src/components/WordSeoSummary.tsx`

### Mobile Home and access

- `src/app/page.tsx`
- `src/components/Nav.tsx`
- `src/components/WordList.tsx`
- `src/components/WordCard.tsx`
- `src/app/about/page.tsx`

### Forever figure, payload, inspector, and sharing

- `src/components/MobileFrequencyStory.tsx`
- `src/components/FrequencyTimeline.tsx`
- `src/components/DeferredForeverFigures.tsx`
- `src/components/FigureShareActions.tsx`
- `src/components/CitationAndSharing.tsx`
- `src/components/MiniInspectorMenu.tsx`
- `src/components/ForeverInstitutionalDoubt.tsx`
- `src/app/words/forever/page.tsx`
- `src/types/foreverRealData.ts`
- `src/types/inspector.ts`

### Narrow-screen QA components

- `src/components/artificial/chart01/ArtificialChart01SemanticChamber.tsx`
- `src/components/artificial/chart02/ArtificialChart02PressureDiagram.tsx`
- `src/components/hub/HubChart01SemanticField.tsx`
- `src/components/hub/HubChart03NamingMachine.tsx`
- `src/components/privacy/PrivacyChart02GeoAttention.tsx`

The complete final source path list is reproducible with `git diff --name-status e9ee61e..4d77759`. The three pre-existing privacy paths and generated build cache such as `tsconfig.tsbuildinfo` are explicitly excluded from audit scope and staging.

## 11. Exact baseline and final measurements

### Pre-existing local route artifact

These raw byte figures come from the pre-existing local production artifact identified in `route-inventory.md` with build ID `qNFv9jd8q4QZPP2pTUjr6`. They are **not compressed transfer sizes** and are not a substitute for fresh Lighthouse results.

| Route | HTML bytes | RSC bytes | Initial JS raw bytes | JS requests |
| --- | ---: | ---: | ---: | ---: |
| `/` | 40,065 | 20,849 | 670,246 | 11 |
| `/words` | 41,726 | 22,015 | 670,246 | 11 |
| `/about` | 168,702 | 82,980 | 677,141 | 11 |
| `/words/forever` | 1,577,554 | 1,104,912 | 1,336,840 | 13 |
| `/words/privacy` | 1,478,587 | 337,119 | 1,007,041 | 12 |
| `/words/artificial` | 171,898 | 30,266 | 1,424,821 | 13 |
| `/words/hub` | 439,658 | 147,699 | 1,330,183 | 13 |
| `/words/depression` | 1,715,718 | 1,319,717 | 820,384 | 12 |
| `/words/data` | 427,771 | 148,070 | 746,339 | 12 |

Approximate constructed client-prop baselines:

- Forever: 1,085,004 bytes, including 738,779 inspector bytes.
- Depression: 1,299,132 bytes.
- Privacy aggregate wrapper estimate: 302,119 bytes, plus a client-imported 252,308-byte world GeoJSON source.
- Data aggregate wrapper estimate: 119,915 bytes.

### Final verification-build route artifact

The following figures come from final source HEAD `4d777597487062c23c9a75f65470ac6e7760abe1` and build ID `EO9j2G4AzAu8Xfjy287UM`, using the same raw prerender/initial-asset method as the baseline. They are raw on-disk bytes, not compressed transfer. The request column is the count of initial JavaScript references, not total network requests; CSS was one 79,256-byte raw asset on every measured route.

| Route | HTML bytes | RSC bytes | Initial JS raw bytes | Initial JS refs | JS delta from baseline |
| --- | ---: | ---: | ---: | ---: | ---: |
| `/` | 57,625 | 29,747 | 670,393 | 12 | +147 |
| `/words` | 43,460 | 22,842 | 670,393 | 12 | +147 |
| `/about` | 170,406 | 83,817 | 677,288 | 12 | +147 |
| `/words/forever` | 943,341 | 496,356 | 776,341 | 13 | −560,499 |
| `/words/privacy` | 1,502,483 | 348,815 | 1,009,182 | 13 | +2,141 |
| `/words/artificial` | 197,500 | 42,716 | 1,427,050 | 14 | +2,229 |
| `/words/hub` | 465,210 | 160,011 | 1,332,461 | 14 | +2,278 |
| `/words/depression` | 1,744,705 | 1,335,451 | 820,224 | 13 | −160 |
| `/words/data` | 452,597 | 160,384 | 748,364 | 13 | +2,025 |

Forever achieved the intended meaningful payload reduction: HTML −634,213 bytes (−40.202%), RSC −608,556 bytes (−55.077%), and initial JS −560,499 bytes (−41.927%). Its explicit browser projection is 455,827 bytes versus the 1,085,004-byte baseline constructed props estimate, a 629,177-byte (57.988%) reduction. Comparing the 455,827-byte projection with the 1,142,920-byte full generated object gives a 60.117% reduction; these two denominators are kept distinct.

Server-visible direct answers and evidence/citation markup intentionally increase raw HTML/RSC on several other routes. The shared action island also creates the small JS regressions shown above. The “no initial-JS regression on any audited route” target is therefore **not met**, even though the main Forever optimization is substantial and Three.js is absent from Forever's initial asset list.

### Before browser layout evidence

| Route/view | Client width | Scroll width | Body overflow | Wider-screen fallback |
| --- | ---: | ---: | --- | --- |
| Home 320 | 320 | 413 | yes | no |
| Home 360 | 360 | 413 | yes | no |
| Home 390 | 390 | 413 | yes | no |
| Home 430 | 430 | 430 | no | no |
| Artificial 320 | 320 | 337 | yes | no |
| Forever 320 | 320 | 320 | no | yes |
| Forever 360 | 360 | 360 | no | yes |
| Forever 390 | 390 | 390 | no | yes |
| Forever 430 | 430 | 430 | no | yes |
| Forever 768 | 768 | 768 | no | no |
| Forever 1440 | 1440 | 1440 | no | no |

All other captured route/viewport rows reported equal body scroll/client width. That result does not prove figure legibility or keyboard equivalence.

### Final after browser and interaction evidence

The saved after audit contains 36 rows: Home, Words, Forever, Privacy, Artificial, and Hub at all six requested viewports. Across all 36 rows:

- `scrollWidth` equals `clientWidth`; no body-level overflow was detected;
- H1 count and main-landmark count are each one;
- duplicate IDs, unnamed visible buttons, visible error overlays, and wider-screen fallbacks are absent;
- Forever's mobile frequency reader is visible at 320, 360, 390, 430, and 768px; the desktop frequency figure is visible at 1440px;
- controls below 44px at 320px are Home 0, Words 0, Forever 0, Privacy 0, Artificial 11, and Hub 0.

The 36 required PNGs show the initial state from the successful build immediately before the final keyboard-only change. They are retained as initial-render evidence, not described as post-keyboard screenshots. Against final build `EO9j2G4AzAu8Xfjy287UM`, a separate 390px Forever interaction check preserved the section hash, moved the range control from 2022 to 2021 with ArrowLeft, exposed a table with 323 data rows and a caption, and retained `390/390` body containment.

Fresh production-console checks produced different results by route: `/words` logged no console entries, while `/words/forever` reproducibly logged one React minified error #418. Development component-level diagnosis was constrained: Turbopack panicked on the symlink/root layout, and the webpack development route compilation timed out and was stopped. The production symptom is therefore recorded as a verified remaining defect without an invented cause.

### Lab and after comparison

| Metric | Baseline | Final | Target/interpretation |
| --- | --- | --- | --- |
| Home mobile LCP | `null` — no valid collector run | `null` — no valid collector run | target ≤ 2.5s remains untested |
| Word mobile LCP | `null` — no valid collector run | `null` — no valid collector run | target ≤ 3.0s remains untested |
| CLS | `null` | `null` | target ≤ 0.1 remains untested |
| TBT lab proxy | `null` | `null` | Home target ≤ 200ms remains untested |
| Speed Index | `null` | `null` | unavailable; no comparison claimed |
| Total requests / transferred bytes | `null` | `null` | unavailable; JS-reference count is not relabelled as total requests |
| Initial JS / CSS / image bytes | baseline raw-JS table; CSS/image transfer `null` | final raw-JS table above; raw CSS 79,256; image transfer `null` | route-wide no-regression target missed; Forever materially reduced |
| RSC/Flight / serialized props | 1,104,912 RSC; 1,085,004 estimated Forever props | 496,356 RSC; 455,827 Forever projection | passed for final Forever artifact |
| Hydration warnings / console errors | baseline captured list `[]` | `/words` fresh `[]`; Forever fresh logs React minified #418 | **failed**: no-hydration-error target not met |
| Mobile-desktop-only fallbacks | Forever frequency: 1 verified | 36-row audit reports no refusal; final 390px interaction confirms mobile story | passed for audited viewports |
| Server-rendered direct-answer sections | baseline: 0 shared top-entry system | shared shell configured on all six word routes; captured word routes show direct answer | implemented; full live-production HTML remains unverified because canonical fetch was blocked |

The raw Forever payload and mobile-fallback targets passed. The route-wide initial-JS and no-hydration-error targets failed. Core Web Vitals and Lighthouse-proxy targets are **unmeasured**, not failed and not passed. The three exact collection failures are recorded in `performance-after.json`; a later valid run must state tool/version, URL, viewport, throttling, cache mode, build ID/commit, and aggregation method.

## 12. Desktop regression and accessibility status

### Desktop

**Partial with visual evidence.** The 1440×900 after screenshots preserve the wheat ground, black editorial rules, oversized word type, and route color identity. The Forever source retains the full desktop frequency visualization at 1360px and wider while using the accessible vertical reader below that breakpoint. Moving the page header into the shared Server Component did not erase the first research chapter in the captured 1440 screenshot. The final source change affected keyboard handling only, but these initial-render screenshots are still described with their pre-keyboard provenance.

This is not a complete desktop-regression pass. Remaining manual checks include:

- route color, scale, rules, and poster composition remain recognizable;
- desktop frequency, hover/selection, evidence inspector, and chapter order still work;
- no duplicated H1/nav or missing research section;
- deeper route-specific 3D/hover sequences and screen-reader behavior;
- the verified Forever hydration mismatch, which prevents a blanket regression pass despite the absence of a visible overlay.

### Accessibility

Implemented improvements include a single shared H1 path, focus-visible/touch-sized P0 controls, semantic mobile frequency figure/caption/table, labelled range control, deterministic Arrow/Home/End keyboard handling, visible frequency caveat, dialog semantics for a pinned inspector, Escape, focus trap/restoration, and live copy status.

**Remaining verification/debt:** screen-reader names across legacy marks, contrast, 200% zoom, reduced motion across legacy animated visuals, safe-area behavior, full inspector restoration, the 11 undersized Artificial controls at 320px, and a complete automated-plus-manual audit. The successful 390px slider/table check does not establish WCAG conformance, and the hydration mismatch remains an accessibility and robustness risk.

## 13. Expected effect by outcome type

These are expected mechanisms, not promised outcomes.

| Outcome | Changes with a plausible mechanism | What would count as evidence |
| --- | --- | --- |
| Qualified impressions | Server-visible bounded answers, stable intent anchors, `/words` navigation, clearer route scope | Query × canonical page impressions with position/device context |
| Organic clicks / CTR | Query-matched spelling/etymology entry copy and clearer scope, if position is competitive | Clicks and CTR within comparable position bands; SERP/snippet observation |
| Post-click usefulness | No Home overflow, visible status, direct answer/coverage/chapter links, real mobile frequency figure, table/evidence access, accessible inspector | Viewport/keyboard/zoom QA; optional approved privacy-respecting aggregate signals |
| Sharing/backlinks/citation | Stable section links, accurate project/DOI citation boundary, figure copy/share action, visible sources/caveats | Function tests, discovered referring pages/backlinks, citation observation |
| Performance | Smaller Forever client slice and future static-first optional 3D loading | Comparable RSC, transfer, JS, LCP/TBT results |

Impression movement cannot be attributed solely to on-page changes; recrawl timing, position, seasonality, competitors, query demand, and Google presentation are confounders.

## 14. 28-day and 56-day measurement plan

### Before release

1. Record final commit, deployment time, and a new release annotation; retain 2026-07-28 as a separate prior release.
2. Export GSC with date, query, page, country, device, clicks, impressions, CTR, and average position.
3. Preserve exact pre-release 28- and 56-day windows.
4. Save final technical, performance, accessibility, link, and screenshot evidence.
5. Do not add a tracking script merely to measure this release.

### Day 28

1. Compare days 1–28 after release with the preceding 28 days.
2. Evaluate exact query × page rows for the matrix clusters; segment mobile/desktop.
3. Compare CTR only within comparable average-position bands and note distribution changes.
4. Check whether target pages gained qualified research/history/spelling/etymology impressions rather than generic mismatched traffic.
5. Inspect canonical/duplicate page behavior and unexpected query cannibalization.
6. Re-run priority route status, raw HTML, overflow, anchor, console, and selected lab tests.
7. Record discovered backlinks/referring pages and verified citation use separately; do not infer them from copy-button availability.

### Day 56

1. Compare days 1–56 after release with the preceding 56 days and compare days 29–56 with days 1–28.
2. Check persistence after recrawl/indexing latency and short-term demand shifts.
3. Re-evaluate each hypothesis as supported, inconclusive, contradicted, or blocked by insufficient data.
4. Keep or revise content only when query intent and source evidence agree.
5. Create route-specific follow-up work for remaining visual/accessibility/performance gaps; do not create thin pages from every observed query.

### Reporting rules

- Keep impressions, clicks, CTR, and average position separate.
- Never backfill missing position.
- Mark privacy-thresholded or absent rows unknown.
- Note title/snippet changes, indexing dates, outages, seasonality, and significant external links.
- Do not describe correlation as causation or guarantee future growth.

## 15. Remaining risks

- The supplied GSC screenshots omit average position, exact query clicks/CTR, country, and query-to-page pairing. Low ranking, competitive-position CTR, and intent mismatch therefore remain separable hypotheses rather than resolved diagnoses.
- The untracked Privacy mobile demo is discovered as `/words/privacy/mobile-demo` by production builds and could be deployed accidentally if unrelated working-tree content is included. It is user-owned, not audit implementation, and must be excluded or explicitly reviewed at release packaging.
- No valid Lighthouse-compatible run completed. LCP, CLS, TBT, Speed Index, total requests, transferred bytes, image bytes, and long tasks remain `null`; raw artifact improvements must not be presented as those metrics.
- Final `npm run verify` passed with exit code 0, but the fresh Forever production console reproducibly logs React minified hydration error #418. This is a verified failure of the no-hydration-error target despite the successful build and absence of a visible overlay.
- Live canonical/redirect verification remains blocked by sandbox DNS. The scoped canonical report obtained zero usable production responses and verified zero production P0 defects; this is a verification gap, not evidence of an outage.
- The final build completed, but its approximately 18-minute internal TypeScript phase remains a build-environment/CI resource consideration. Static generation completed 31/31 pages in 83 seconds and dataset validation emitted zero warnings.
- Existing Three.js and dense SVG figures on Artificial, Hub, Data, Depression, and parts of Forever still need route-specific static-first mobile translation.
- Some answer records rely on secondary lexical evidence and must retain confidence/caveat language.
- The legacy Forever institutional/platform-doubt visual includes authored modern-search scoring despite weak or zero recovered hits for some phrases. The new direct answer deliberately treats this as an interpretive question rather than an established corpus result; the visual's evidence model remains a follow-up risk.
- Legal, clinical, and rights-related material has high overclaim risk.
- A new server-rendered answer can improve clarity without being selected for a search snippet or changing ranking.
- Copy/share actions increase affordance, not proof of sharing, citation, or backlink creation.

## 16. Items deliberately not implemented

- No meta keywords.
- No blanket title/description rewrite after the 2026-07-28 release.
- No thin page per spelling, definition, or etymology query.
- No generic dictionary answer generated from model memory.
- No FAQPage or schema added solely for quantity/rich-result speculation.
- No project DOI copied into each route as a separate Dataset identifier.
- No downloadable `distribution` without an accurate rights model.
- No licensing change and no publication of restricted/raw research caches.
- No third-party analytics, advertising, account, profiling, or cookie system.
- No new chart or design-system dependency.
- No adoption of the user-owned uncommitted Privacy mobile demo.
- No blanket visual unification that erases the evidence logic of each word study.
- No claim that zero clicks proves a poor snippet, and no invented average position.

## 17. Completion status

**Final status: `PARTIAL_WITH_EVIDENCE`.**

This status is supported by eight scoped commits through `4d777597487062c23c9a75f65470ac6e7760abe1`, final build `EO9j2G4AzAu8Xfjy287UM`, exit-code-0 `npm run verify`, zero-warning dataset validation, exact raw before/after route artifacts, 36 required before and after PNGs, a 36-row viewport audit, a passing final Forever hash/keyboard/table interaction check, a 40-row source-bounded query matrix, and explicit preservation of unavailable values.

It is not `COMPLETE` because Forever has a verified hydration mismatch, live canonical/redirect checks remain network-blocked, Lighthouse/equivalent measurements remain unavailable, 11 Artificial controls remain below the target size at 320px, complete manual accessibility/desktop interaction coverage is unfinished, and other route-specific mobile figures remain deliberately deferred. It is not `BLOCKED_WITH_EVIDENCE` overall because implementation, verification, artifact measurement, viewport QA, and the core Forever interaction flow succeeded; `BLOCKED_WITH_EVIDENCE` applies specifically to the live canonical sub-audit.

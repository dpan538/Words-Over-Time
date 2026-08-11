# Search discovery and mobile research implementation plan

> **Historical implementation receipt, not current mobile design governance.** Any first-screen order, reusable-reader, figure inventory, desktop/mobile relationship, interaction, or completion direction in this plan is superseded by [`docs/design/mobile/words-over-time-mobile-design-governance.md`](../design/mobile/words-over-time-mobile-design-governance.md). Past implementation evidence remains historical; it must not be used to cap mobile analysis, justify parity with desktop, bypass user-approved predesign, or replace the required mobile-only swipe/accordion card system.

**Plan date:** 2026-08-08 (Australia/Brisbane)

**Branch:** `audit/mobile-search-growth-2026-08`

**Baseline source:** `e9ee61e57294bb99fc4594a1b53b75935a244b53`

**Final verified source:** `4d777597487062c23c9a75f65470ac6e7760abe1`

**Final build:** `EO9j2G4AzAu8Xfjy287UM`

**Existing search release annotation:** 2026-07-28
**Status:** `PARTIAL_WITH_EVIDENCE`

This is a test plan, not a traffic forecast. Search changes are hypotheses; research claims remain bounded by repository evidence; metrics that the available tooling could not collect remain `null`.

## Safety and release boundary

The audit did not adopt, restore, stage, or commit these pre-existing user changes:

- deleted `docs/research/privacy/processed/privacy_geo_spatial_metrics_processed.json`;
- untracked `src/app/words/privacy/mobile-demo/`;
- untracked `src/components/privacy/PrivacyMobileExperience.tsx`.

Raw/cache evidence, source values, licensing, and restricted data were not changed. The untracked mobile-demo route is nevertheless discovered by a working-tree build; release packaging must exclude it unless the user explicitly approves it.

## Implemented P0/P1 releases

| Priority | Release | Evidence and release result |
| --- | --- | --- |
| P0 | Server-rendered word-study shell | Six canonical word routes now expose one H1, a source-bounded direct answer, caveat, coverage, related questions, and stable section anchors before the poster. Raw final HTML contains the answer. |
| P0 | Mobile Home and `/words` discovery | Primary nav includes Home, Words, About; status is not hover-only; the first mobile screen explains the source-led project; no filter JS was added for seven items. |
| P0 | Forever mobile frequency story | One selected series, purpose-built SVG, visible interpretation, coverage/scale/caveat, source disclosure, 323-row table, section sharing, and keyboard/tap inspection replace the orientation refusal below 1360px. |
| P0 | Narrow-screen containment | Final 36-row browser matrix records no body overflow at 320, 360, 390, 430, 768, or 1440px for Home, Words, Forever, Privacy, Artificial, and Hub. |
| P0 | Core accessibility | Shared focus-visible and target sizing, one-H1 correction, bottom-sheet inspector semantics, Escape/focus trapping/restoration, captions, table alternative, and explicit range Arrow/Home/End handling are present. Artificial retains 11 controls below 44px and remains debt. |
| P1 | Forever payload projection | Browser props are projected instead of spreading the full generated dataset; inspector data retains only referenced summaries; optional Three figures start with useful static evidence and approach-viewport enhancement. |
| P1 | Citation and sharing | Canonical section links, project citation, DOI wording, Web Share enhancement, clipboard/manual fallback, and `aria-live` feedback are reusable conclusion/figure surfaces. |
| P1 | Claim-boundary review | All 18 direct-answer records were reviewed against repository evidence; generic dictionary expansion and unsupported linear chronology were removed. |

## Exact final validation

`npm run verify` exited 0 on the final source tree:

- TypeScript: pass;
- data validation: 46 terms, 27 sources, 29 evidence items, 37 relations, 0 warnings;
- optimized compilation: 4.5 minutes;
- Next internal TypeScript: 18.0 minutes;
- page-data collection: 30.9 seconds;
- static generation: 31/31 pages in 83 seconds.

The long internal TypeScript time is a deployment-runner risk, not a failure. The build also discovers the out-of-scope user mobile-demo route.

Final raw artifact measurements are recorded in `performance-after.json`. Forever changed from 1,577,554 to 943,341 raw HTML bytes, 1,104,912 to 496,356 raw RSC bytes, and 1,336,840 to 776,341 referenced raw initial-JS bytes. These are artifact sums, not compressed transfer or Core Web Vitals.

The final interaction proof at 390×844 records:

- `#spelling-frequency` survives load;
- ArrowLeft changes the range accessible name from 2022 to 2021;
- the yearly table exposes one table, 323 rows, and a descriptive caption;
- opening the table keeps body/document width at 390px.

The clean `/words` control tab has no warning/error. A fresh `/words/forever` tab reproducibly logs React minified error `#418`, a hydration mismatch. Therefore the no-hydration-error gate fails. A bounded component-level diagnosis was inconclusive: the temporary Turbopack probe rejected an out-of-root `node_modules` symlink, while the webpack development route did not finish compiling within the diagnostic window. Treat this as verified P1 debt, not a clean console.

## Search hypothesis plan

| ID | Testable hypothesis | Primary outcome | Guardrail |
| --- | --- | --- | --- |
| H-IMP-01 | Server-visible, evidence-bounded answers and stable anchors may help Google associate history/spelling queries with canonical word pages. | Exact query × page impressions at 28 and 56 days | Interpret with average position and device; do not infer ranking from implementation. |
| H-CTR-01 | Query-aligned first-screen wording may improve qualified clicks when position is competitive and comparable. | Clicks and CTR inside comparable position bands | Zero clicks alone is not evidence of a weak snippet. |
| H-MOB-01 | Replacing the wider-screen refusal may improve post-click usefulness for mobile visitors. | Mobile interaction/overflow QA plus query-page engagement evidence if privacy-respecting data becomes available | Do not translate usability into a ranking claim. |
| H-PERF-01 | Smaller Forever client props and initial assets may reduce load/hydration work. | Comparable transferred bytes, LCP, TBT, RSC, initial JS | Only raw artifact bytes are presently measured. |
| H-SHARE-01 | Stable figure links and accurate citation actions may increase referenceability. | Functional actions plus observed referring pages/citations | Button presence does not prove backlinks. |

Average position is unknown in the supplied screenshots. No GSC export existed under `docs/audit/input/`; the template and 40-row query/page hypothesis matrix therefore leave missing position as unknown.

## 28-day and 56-day decision plan

At 28 days:

1. annotate the actual deployment while retaining the 2026-07-28 annotation;
2. export date, query, page, country, device, clicks, impressions, CTR, and average position;
3. compare exact query × canonical page for 28 days before/after, segmented by device;
4. compare CTR only inside comparable position bands;
5. check intended page/anchor association and route cannibalization;
6. rerun canonical, 320–430px overflow, console, and valid lab measurements;
7. record discovered citations/referring pages separately from GSC.

At 56 days:

1. repeat with 56-day windows and a second 28-day cohort;
2. separate persistent movement from recrawl/ranking fluctuation;
3. prioritize qualified research/history intent over unsupported generic-definition demand;
4. keep, revise, or revert each hypothesis from position-controlled evidence;
5. create substantial evidence-backed sections, not thin pages for query variants.

## Commit sequence

The eight source/audit commits since the baseline are:

1. `74a6a7b docs: add SEO and mobile baseline audit`
2. `aaa6016 feat: establish server-rendered word study shell`
3. `6a13426 feat: make home and navigation mobile-first`
4. `6f330b8 feat: replace mobile frequency fallback`
5. `ecccefd fix: tighten source-backed claim boundaries`
6. `e3da304 fix: close mobile QA gaps`
7. `eae9aeb fix: contain artificial pressure legend`
8. `4d77759 fix: support keyboard frequency scrubbing`

The final evidence commit must stage only `docs/audit/**`; generated `tsconfig.tsbuildinfo` and the three user-owned Privacy paths remain excluded.

## Deferred work and release gates

The following are deliberately not represented as complete:

- valid Lighthouse-equivalent LCP, CLS, TBT, Speed Index, request, transferred-byte, and long-task measurements: all remain `null` after documented collector/Chrome failures;
- live production hostname, one-hop redirect, query preservation, trailing slash, status, and 404 verification: DNS resolution failed in this environment, so the live canonical sub-audit is `BLOCKED_WITH_EVIDENCE` rather than an outage claim;
- the Forever hydration mismatch;
- Artificial's 11 sub-44px controls;
- initial Three.js removal from Artificial and Hub;
- complete vertical semantic translations for every route-specific visual;
- full screen-reader, 200% zoom, reduced-motion emulation, and bottom-sheet focus-restoration execution across every route;
- static figure PNG/image-sitemap expansion where a same-data rights-safe generation pipeline has not been established;
- additional Dataset fields whose route-level identifier, version, coverage, basis, variable model, equivalence, or distribution rights are not established.

Also excluded: meta keywords as a ranking mechanism; indiscriminate title rewrites; FAQ/schema quantity; thin query pages; model-memory definitions; first-attestation claims from frequency; per-route DOI identifiers; unlicensed downloads; login, profiling, trackers, or third-party scripts.

## Completion rule

`PARTIAL_WITH_EVIDENCE` is the correct status. Material P0/P1 implementation, a verified production build, exact raw payloads, 36 before and 36 required after screenshots, 36 responsive DOM rows, and final mobile interaction proof exist. It is not `COMPLETE` because valid lab performance metrics, live production redirect/status evidence, the Forever hydration fix, several route-specific mobile translations, and the complete assistive-technology matrix remain open. It is not globally blocked because the implemented work and local evidence are usable; only the live canonical sub-audit is externally blocked.

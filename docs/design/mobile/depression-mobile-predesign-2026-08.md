# Depression mobile — sticky data-window predesign

**Status:** implementation authorised by the user on 2026-08-15

**Scope:** mobile-only `/words/depression` edition. Desktop Depression remains read-only.

## 1. Approved exception and interaction model

The user explicitly authorised a Depression-specific exception to the normal mobile word-study 60 / 30 / 10 allocation and the horizontal evidence-card rail. The page instead uses six full-height, vertical report movements. Each movement has a coloured narrative field and one square paper-coloured data window in the same viewport position. Source, method, caveat and rights material belongs in the final, default-closed disclosure.

The window is `position: sticky`, not globally fixed. It stays at one readable location while its own movement is active, then exits with that movement. This prevents the data panel from covering the final disclosure or obscuring the next chapter. The visible front contains the core finding; the flipped back adds detailed series. Flip is pointer- and keyboard-operable, with an instantaneous reduced-motion alternative.

## 2. Reference reconstruction

| Supplied reference | Depression use | Retained geometry / behaviour | Explicitly omitted |
| --- | --- | --- | --- |
| Fathom phone composition | Six report movements | Dark colour upper field; paper lower field; square data window crossing their seam; compact ruled header | Phone frame, logo, contact copy, device controls |
| Strava year report | Crisis movement | Large result number; independent unit; fine lollipop stems with direct year labels | Brand, time/activity claims, months-as-data shell |
| Two metric-statistics cards | Print, plateau and diagnostic movements | Capsule-scale information density, large direct results, chart occupying lower card field | Generic dashboard navigation, false percentage or part-to-whole encoding |
| Statistics 100% columns | Visual restraint reference only | Fine rules, column rhythm, direct scales and metadata density | 100% stacking: the Depression evidence has no sense-classified shared denominator |
| Statistics step / blocks / bars | Crossovers and clinical series | Stepped time trace, modular result blocks, aligned local-scale small multiples | Any visual suggestion that independently scaled panels share a quantitative scale |

At 390 px, the page uses an 18 px outer gutter. The square window is `min(356px, viewport − 36px, viewport-height − 204px)` wide, starts at roughly 39svh while sticky, and overlaps the coloured/paper seam. It carries a 1.5 px ink rule and a 6 px structural offset shadow. White text only appears on contrast-safe dark field colours; values and chart labels are ink on paper.

## 3. Research question and lead finding

**Question:** How does one spelling travel between several forms of “lowering,” and what does its book-frequency history actually support?

**Lead finding:** `depression` reaches **43.33 appearances per million corpus words in 1932**, its highest observed annual rate in the retained Google Books series. Independent economic phrase series also rise in the 1929–1939 period. This supports an economic context reading of the peak; it does **not** classify every occurrence in the core series as economic or clinical.

## 4. Figure contracts in reading order

| ID / period | Front and back | Inputs and formula | Unit / visual rule | Caveat |
| --- | --- | --- | --- | --- |
| D01 / c.1400–1799 | Front: six lexical anchors. Back: early-series comparison. | `depression_prehistory.records`, filtering the six distinct branch records. Back: Ngram arithmetic means for 1700–1799. | Year + lexical source; then appearances per million corpus words. Timeline marks are anchors, never a frequency series. | Secondary lexical-source dates are neither corpus hits nor first-use claims. |
| D02 / 1800–1873 | Front: period-average comparison. Back: annual `depression`, `melancholy`, `anxiety` lines. | Annual Ngram fractions × 1,000,000; arithmetic mean across inclusive years. | Appearances per million corpus words; shared line domain. | Neighbour words are not synonyms. |
| D03 / 1874–1928 | Front: core-word crossover. Back: financial, business and economic phrase mini-series. | Nine-year centred annual averages; first 20-year run where `depression > melancholy`. Independent phrase frequency series. | Core comparison shares a domain; back panels have separately printed local maxima. | A sustained form-frequency crossover is not semantic replacement. |
| D04 / 1929–1939 | Front: annual core lollipops and 1932 peak. Back: three economic phrase lines plus NBER band. | Annual Ngram core and phrase fractions × 1,000,000. NBER dates are an independent contextual event layer. | Front 0–45 per million; back 0–3.2 per million shared phrase scale. | NBER is not lexical evidence; coincidence is not exhaustive sense classification. |
| D05 / 1940–1979 | Front: two post-crisis averages. Back: three clinical phrase local-scale series. | Period arithmetic means; annual phrase series. | Per-million rates; local maxima printed in each back panel. | Low phrase frequency is not prevalence or diagnostic practice. |
| D06 / 1980–2022 | Front: first sustained threshold years. Back: diagnostic phrase and `anxiety` local-scale series. | Nine-year centred averages; first five consecutive years over 0.01 or 0.1 per million threshold. | First sustained year and labelled local rate scales. | Labels and anxiety are distinct terms; neither is a condition count. |

## 5. 390 px storyboard

1. Mobile site header.
2. Opening: `WORD STUDY`, `depression`, thesis, six-step index.
3. D01 dark-indigo semantic history field + sticky window.
4. D02 mineral-green print-visibility field + sticky window.
5. D03 umber crossover field + sticky window.
6. D04 oxblood economic-crisis field + sticky window.
7. D05 slate post-crisis field + sticky window.
8. D06 plum diagnostic-branch field + sticky window.
9. Closing finding.
10. Folded source/corpus, method/unit, and limits disclosures.
11. Mobile footer language.

There is no desktop component import in the mobile study. The final disclosure folds long method and rights copy, but every chart retains an adjacent unit and a visible local caveat.

## 6. Derived data contract

`scripts/build_depression_mobile_research.ts` deterministically produces `src/data/generated/depression_mobile_research.json` from the retained Depression frequency, lexical prehistory, NBER context and clinical-vocabulary files. It calculates all displayed period means, peak values, sustained crossover year and threshold years. `npm run data:depression:mobile:validate` rejects an out-of-date artifact.

The card component consumes only the typed artifact in `src/types/depressionMobileResearch.ts`. It contains no untraced numeric display arrays.

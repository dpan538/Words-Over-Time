# Forever raw-data audit

Audit ID: `forever-raw-audit-2026-08-11`

Repository baseline: `audit/mobile-search-growth-2026-08` at `33bc7ab2acadd25d134d2d87433318423e8c9ef0`

Formal outcome: `DATA_GATE=STOP_RAW_DATA_MISSING`

This is a data gate, not a visual review. The audit does not authorize a Mobile Forever rebuild. Every candidate figure contract is `productionEligible=false`; the expected STOP status is a valid, passing audit result.

## Generated audit artifacts

- `src/data/generated/forever_analysis.json`: typed aggregate audit, denominator decision, raw gaps, untraceable inputs, assertions, and 15 raw → derived → rendered spot checks.
- `src/data/generated/forever_raw_data_manifest.json`: 32 audited inputs with SHA-256, fields, granularity, record counts, date basis, source/corpus/release, missingness, duplicate policy, transform history, and rights boundary, including the STOP report route, renderer, public metadata, and official denominator authority record.
- `src/data/generated/forever_findings_registry.json`: seven non-circular findings in question → fields → filters → grouping → denominator → formula → result → caveat → source form.
- `src/data/generated/forever_figure_contract_registry.json`: seven candidate contracts; none is production eligible.
- `src/types/foreverAnalysis.ts` and `src/data/foreverAnalysis.ts`: typed contract and loader.

Generate with `npm run data:forever:audit`. Validate current inputs and byte-exact generated outputs with `npm run data:forever:audit:validate`. Validation is now part of `npm run verify` immediately after typecheck.

The analyzer contains no current-time value. It hashes every registered input as bytes and uses deterministic insertion/order rules. It discovers Forever-named scripts/generated data plus dedicated raw/source directories and fails if a newly discovered candidate has not been audited and registered. Text, JSON, TSV, and future binary/shard inputs retain byte-level SHA-256 identity; dedicated raw paths receive a `retained-raw` role and cannot fall through as render consumers. The gate is derived from executable required-layer predicates, rather than fixed as a success constant or filename presence. `--check` also fails if any input digest changes, a generated document is stale, a required manifest input disappears, reciprocal finding/contract/gap links break, a source selector is neither registered nor an exact expected raw path, fewer than ten rendered spot checks remain, a denominator becomes shared without common-denominator evidence, or any figure becomes eligible while the gate is stopped.

Every named validation assertion computes its own boolean predicate before the artifact is emitted. The future-input predicates are deliberately conservative: Gutenberg requires 23 non-empty checksum-bound official texts and edition/rights metadata; attestations require source-bound non-empty quotations and precision/verification fields; modern capture requires ten checksum-bound search responses and at least sixteen unique page revisions with distinct date/license fields; coverage requires explicit zero/not-searched/unavailable/incomparable states; rights must bind every raw path; and the transform manifest must cover every registered Forever fetch/build script and raw payload with checksum-bound inputs and outputs. A placeholder file cannot advance the gate.

## P0: Google Ngram denominator

The repository only contains Google Viewer-normalized fractions. It does not contain raw match counts or a same-release annual word-token denominator.

Evidence:

- `docs/research/forever/sources/google-ngram-official-authority.json` retains official Google URLs, access date, source locations, paraphrased denominator/release claims, capture limitation, and rights boundary. Google’s official explanation distinguishes a bigram percentage relative to all bigrams from a unigram percentage relative to all unigrams.
- `scripts/fetch_ngram_forever.ts:7-11` registers four mixed-order queries over 1500–2022 with corpus alias `en` and smoothing 0.
- `scripts/fetch_ngram_forever.ts:80-86` calls `https://books.google.com/ngrams/json` with `case_insensitive=false`.
- `scripts/fetch_ngram_forever.ts:93-99` maps each returned `timeseries` fraction to `frequencyPerMillion = value * 1_000_000`.
- Although the response type includes `parent` and `type` at `scripts/fetch_ngram_forever.ts:13-18`, those fields and the raw response are not retained.
- `src/data/generated/forever_frequency.json:2-10` stores a mutable `corpus=en` URL and says the values are yearly Ngram fractions. No corpus release, raw `match_count`, annual word-token total, volume count, source-file checksum, or raw-response path exists.

Allowed units under the repository's current option B are:

| Query | Order | Required local unit |
| --- | ---: | --- |
| `forever` | 1 | per million unigrams |
| `for ever` | 2 | per million bigrams |
| `forevermore` | 1 | per million unigrams |
| `forever and ever` | 3 | per million trigrams |

The joined and spaced forms therefore cannot share a generic “per million” scale. Joined/spaced share, ratio, crossover, overtaking year, delta, and orthographic dominance are prohibited. `src/components/ForeverFormCurrent.tsx:102-106`, `138-141`, and `175-215` currently make or visually invite that invalid comparison; those mappings are excluded from research authority.

The analyzer cannot enable a shared scale from a filename or from globally finding `match_count`-like keys. It recognizes only a registered `docs/research/forever/raw/google/common-denominator.json` manifest whose source record uses official Google dataset URLs, a persistent corpus/release, a rights boundary, and checksums that are recomputed against separately retained match-row and annual-total TSV bytes. The canonical registry must declare a complete, unique family and cover all four currently registered Ngram queries. TSV year/count/token cells must pass strict non-empty integer lexical checks, so an empty cell cannot become numeric zero. The rows must contain both exact joined/spaced forms with their correct n-gram orders and release, unique form-year keys, and the complete canonical preregistered year window; every year must have a positive annual word-token total. The exact Viewer response is likewise a separate checksum-bound raw file whose `ngram`, `parent`, `type`, and finite non-negative timeseries must match the registered request range. Any partial, transformed, one-off, or derived JSON remains unavailable evidence and keeps the gate stopped.

The often-mentioned 323-row table is the inclusive 1700–2022 slice of the `forever` Viewer series: `2022 - 1700 + 1 = 323`. It is 323 unigram-normalized query-year observations, not 323 raw match-count rows. The generated file has four series × 523 years = 2,092 observations total.

## Data-layer inventory

The JSON audit manifest is the machine-readable inventory. The high-level result is:

| Layer | Current path | Granularity / n / time | Source and release | Blocking gaps |
| --- | --- | --- | --- | --- |
| Term/form registry | `src/data/forever.ts`; query arrays in four fetch/build scripts | Fragmented source literals; no canonical row set | Repository-authored; legacy sources are marked planned/not selected | No versioned order/case/joined-spaced/hyphen/preregistration policy |
| Ngram observations | `src/data/generated/forever_frequency.json` | 4 query series, 2,092 query-year rows, 1500–2022; `forever` has 323 rows in 1700–2022 | Google Books Ngram Viewer, corpus alias `en`, release unpinned | Raw response, release, match counts, annual totals, typed missingness, rights manifest |
| Attestation claims | `src/data/generated/forever_prehistory.json` | 6 secondary claim rows, approximate 1375–1819 | Etymonline/Wiktionary/Merriam-Webster claims; no release/snapshot | 6/6 quotations blank; no edition/access/rights/primary occurrence; conflicting `forevermore` dates |
| Gutenberg inventory | `src/data/generated/forever_gutenberg_sources.json` | 23 selected works, 3,249,043 tokens, 332 occurrence-role rows, work years 1726–1930 | Project Gutenberg URLs, release/update unpinned | Raw text absent; no checksum, edition/translator/language/capture/selection manifest |
| Modern capture | `src/data/generated/forever_modern_context.json` | 10 queries, 17 snippet rows, 16 unique URLs, revision years 2024–2026 | Wikinews API search, mutable snapshot, no release | Raw responses/totals/continuation/pageid/revid/capture time/page date/text date absent |
| Coverage | none | none | none | Cannot distinguish observed zero, not searched, unavailable, and incomparable |
| Derived display data | `forever_dataset.json` and six sidecars | Heuristic/display arrays including 32 flows, 95 atlas nodes, 42 ledger rows, 69 network nodes, and 482 inspectors | Mixed upstream layers | Not raw; incomplete missingness; mixed units; manual/heuristic transforms |

No upstream raw file layer exists under `docs/research/forever`; the new `sources/` record documents official authority but is explicitly not a raw response or dataset capture. The existing generated captures contain a `generatedAt` timestamp and are not byte-stable if their network scripts are rerun. The new audit artifacts are byte-stable over unchanged inputs; they do not repair the upstream capture deficiency.

## Gutenberg findings

`scripts/fetch_gutenberg_forever.ts:143-167` manually seeds 23 books and work years. It fetches the first successful one of four URL patterns (`174-197`), strips boilerplate (`199-206`), performs lowercase ASCII tokenization (`208-216`), and detects either token `forever` or adjacent tokens `for` + `ever` (`248-313`). It does not retain the downloaded texts.

Within this selected inventory only:

- 3,249,043 processed tokens;
- 321 form rows: 133 exact joined `forever`, 188 exact spaced `for ever`;
- 11 targeted-phrase rows;
- 332 total occurrence-role rows but only 329 unique `(source id, tokenIndex)` positions; three rows are duplicate analytic roles where phrase and form begin at the same token.

The joined/spaced separation is present, but the tokenizer can convert punctuation/hyphen boundaries into adjacency. At least five generated snippets contain spaced `for ever and ever`, while the target phrase registry only contains joined `forever and ever` (`scripts/fetch_gutenberg_forever.ts:7-15`). Work publication year cannot date wording in an unrecorded English edition or translation. The layer may eventually support a declared selected-text inventory after raw texts, edition metadata, checksums, selection rules, and passage IDs are captured; it cannot support population trend or orthographic dominance.

## Attestation and modern findings

`scripts/build_prehistory_forever.ts:7-104` hard-codes six secondary-source claims and manually maps approximate labels such as “late 14c.” and “late 17c.” to 1375 and 1680. All six quotations are empty. Five records are secondary lexical claims and one is an explicit conflicting claim; four have medium and two low confidence. This cannot support a first-use result, a unique-passage archive lattice, or an exact-date rail.

`scripts/fetch_modern_context_forever.ts:9-20` registers ten queries with a maximum of six API rows each. It dedupes `title + snippet`, not URL/revision/passage (`158-172`), assigns revision year as the record year (`174-185`), and infers license from that year (`188`, `247-254`). The generated capture contains 17 rows for 16 URLs: the Finnish school-shooting page is retained once for `forever` and again for `"remembered forever"`, producing phrase count 2 but document frequency 1. Four registered queries have no retained row, yet raw result totals/statuses are absent, so missing/unavailable cannot be distinguished from observed zero. A one-time search inventory cannot establish persistence, survival, prevalence, or trend.

## Derived and source-literal exclusions

The following must not continue as research results:

- Every placeholder count/frequency/token total/semantic score/association/network/evidence literal in `src/data/forever.ts:15-624`.
- The `simpleLogDice` values in `scripts/build_forever_dataset.ts:475-478`, `547-548`, and `583-590`; the call supplies candidate count equal to joint count, so the score is not a defensible association statistic.
- Mixed-denominator flows at `scripts/build_forever_dataset.ts:701-719`.
- Heuristic category/ledger weights, selected first-six snippets, duplicated “all” snippets, editorial atlas relations, manual network coordinates (`scripts/build_forever_dataset.ts:622-699`, `722-1095`), and the globally false long-span `comparable: true` flag (`1777-1794`).
- Hard-coded evidence, score, semantic-year, and geometry arrays in `ForeverInstitutionalDoubt.tsx`, `VariantDriftField.tsx`, and `ContextSignalField.tsx` listed by exact locations in `forever_analysis.json`.
- The mobile attestation rail, integer endpoint fields, 1930–2024 empty field, and modern rake in `ForeverAttestationHinge.tsx:114-133` and `ForeverRecurrenceField.tsx:113-273`.
- Generic Viewer units and independently shape-scaled series in `ForeverFormCurrent.tsx`, `FrequencyTimeline.tsx`, and `MobileFrequencyStory.tsx` until a valid contract is implemented.

The original fetch/build pipeline also writes `new Date().toISOString()` in every stage (`fetch_ngram_forever.ts:129`, `fetch_gutenberg_forever.ts:316`, `build_prehistory_forever.ts:146`, `fetch_modern_context_forever.ts:243`, `build_forever_dataset.ts:1761`), so rerunning it cannot meet byte-stability without a capture/provenance redesign.

## Figure-contract decision

Even if the Google Viewer series are placed in strict n-gram-order facets with local units and no direct joined/spaced comparison, the other current layers are not sufficient for five production panels. There are at most three analytic directions after raw/provenance repair:

1. a typed evidence-coverage matrix;
2. separate Viewer-normalized facets, after raw response and corpus release are pinned;
3. a selected Gutenberg form inventory, after official text/edition/checksum/selection capture and passage dedupe.

The source-bound date ledger, modern source matrix, orthographic-family common-scale small multiples, and transition robustness field remain blocked. A separate archive lattice is not registered as a candidate contract because the current records cannot establish even one verified unique source passage; its raw requirements are represented by the date-ledger and selected-Gutenberg blockers. Seven actual candidate contracts are registered, including coverage, Viewer facets, and the selected-Gutenberg inventory; all are `productionEligible=false`.

The correct current status is therefore `STOP_RAW_DATA_MISSING`, not `STOP_INSUFFICIENT_ANALYTIC_DEPTH`. Depth should be reassessed only after the missing upstream raw inputs and coverage/rights/transform registries exist.

## Minimum raw capture set

Before another gate review, retain:

1. one canonical form registry with exact query, n-gram order, case, hyphen, joined/spaced, normalization, and complete-family preregistration policy;
2. exact raw Google Viewer response plus request/corpus-release manifest and SHA-256;
3. if a common scale is pursued, official same-release `match_count` rows and annual word-token totals;
4. all 23 official Gutenberg text files plus metadata, edition, translator, language, release/update, capture date, selection rule, rights, and SHA-256;
5. primary/authoritative attestation captures with quotation, edition, date precision/basis, access date, verification, and reuse boundary;
6. all ten raw Wikinews search responses including total/continuation/zero-result state, plus the 16 unique page revision captures with page/revision IDs, text/page/capture dates, license metadata, and passage hashes;
7. typed coverage, rights, and transform manifests.

## Approximately 1.2 GB Google shard boundary

No raw dataset, Viewer response, or shard was acquired. Official Google documentation was consulted to audit denominator semantics and release boundaries, and the resulting source record retains only URLs, locations, access date, and paraphrases. The “approximately 1.2 GB” value is treated only as a requested acquisition planning envelope; the repository contains no evidence that an exact required official shard has that size.

Before acquisition, pin the official Google corpus release, identify the exact unigram/bigram (and only if preregistered, trigram) shards, verify compressed and expanded sizes, disk/memory constraints, URLs, checksums, license/reuse terms, and extraction filters. A lexical shard alone is insufficient for a common scale: the same-release official total-count/year input is also required. If those official inputs cannot be obtained and retained reproducibly, the data gate remains `STOP_RAW_DATA_MISSING`.

# Forever raw-data audit

Audit ID: `forever-raw-audit-2026-08-11`

Schema: `2.0.0`

Round baseline: `audit/mobile-search-growth-2026-08` at `3f6d025`

Google acquisition/contract outcome: `GOOGLE_COMMON_DENOMINATOR_CONTRACT_READY`

Page-level state: `DATA_GATE=STOP_RAW_DATA_MISSING`; `pageImplementationAuthorized=false`

The Google outcome and the page state are separate decisions. Two Google analyses are now independently eligible, but this round does not authorize a Mobile Forever implementation and does not add or restore any figure. The page-level STOP remains because the other candidate panels still lack their own complete raw/provenance closures.

## Gate model

Schema 2 separates:

- `figureContracts[].productionEligible`: whether one finding and its active dependency closure pass;
- `pageImplementationAuthorized`: whether the Mobile Forever page may implement figures.

A figure contract may be `productionEligible=true` while `pageImplementationAuthorized=false`. A page STOP no longer forces every figure contract to false. The current registry contains seven candidate contracts: the two fixed Google contracts are eligible; coverage, orthographic-family, date-ledger, selected-Gutenberg, and modern-matrix contracts remain ineligible.

The Google contracts are evaluated independently:

| Contract | Eligibility | Dependency boundary | Allowed result |
| --- | --- | --- | --- |
| `contract-google-fixed-viewer-separate-facets` (A) | `true` | fixed Viewer request/response, checksum manifest, rights, Viewer freeze transform, acquisition script | separate order-specific Viewer facets only |
| `contract-google-fixed-raw-common-denominator` (B) | `true` | two core raw shards, exact wide records, derived annual expansion, `totalcounts-1`, acquisition/source/rights/checksum/transform manifests, acquisition script | exact-form annual rates on one word-token denominator |

Removing an A-only file makes A ineligible without changing B. Removing a B-only file makes B ineligible without changing A. Shared release, rights, script, transform, and checksum records are validated within each contract's own closure.

## Fixed Google release

The variable `en` / current corpus path is excluded from both new contracts. The frozen identity is:

- Viewer shorthand: `eng_2019`;
- Viewer numeric corpus parameter: `26`;
- persistent identifier: `googlebooks-eng-20200217`;
- raw release directory: `20200217/eng`;
- expected and observed upper year: `2019`.

The Viewer request is dual-pinned: its content values are `forever:eng_2019` and `for ever:eng_2019`, and its query parameter is `corpus=26`. A request using `corpus=eng_2019` is prohibited because the JSON endpoint can ignore that alias and return current data. The response contains exactly two tagged NGRAM rows, 520 unsmoothed finite non-negative points per row for 1500–2019, and SHA-256 `b68f85d23f7ccced84966dc0d2d5841a18bc0f7aaaf23511c5f65f48f2e6cad6`.

No 2020–2022 current-Viewer values enter either contract. The old 1500–2022 arrays remain `excluded/legacy`; their 323-row 1700–2022 slice is an audited historical observation, not fixed-release evidence.

## Core family

`core-family-registry.json` stores three scopes instead of one mixed family:

- `coreForms`: `forever` (1-gram, joined) and `for ever` (2-gram, spaced);
- `optionalRelatedForms`: `forevermore` (1-gram), which cannot block the core pair;
- `outOfScope`: `forever and ever` (3-gram), an independent phrase not acquired in this round.

The repository does not download a trigram shard. `forevermore` is extracted opportunistically from the unigram shard, but its inputs and transforms are outside contract B's active dependency closure.

## Object acquisition and identity

The official Google object discovery and local cache validation retained HTTP status, `Content-Length`, `Last-Modified`, ETag, `x-goog-hash`, release, retrieval timestamps, disk preflight, local SHA-256, local MD5 hex/base64, and comparison with the official MD5.

| Object | Official path | Compressed bytes |
| --- | --- | ---: |
| core unigram shard | `20200217/eng/1-00018-of-00024.gz` | 593,921,274 |
| core bigram shard | `20200217/eng/2-00407-of-00589.gz` | 647,005,430 |
| annual totals | `20200217/eng/totalcounts-1` | 13,546 |

The two core shards total 1,240,926,704 compressed bytes; all three objects total 1,240,940,250 bytes. Large files live only in the gitignored `.cache/google-ngram/20200217/eng/` cache. They are never Git or Git LFS inputs. Downloads use `.part`, range resume, length/hash verification, and atomic rename.

`fixedRawCommonDenominator.validation.acquisitionIdentity` requires every local cache record to have `verifiedAgainstOfficialMd5=true`; its MD5 hex must equal the normalized official ETag and its base64 MD5 must occur in `x-goog-hash`. An arbitrary local SHA-256 string is not sufficient.

## v3 wide records and annual expansion

The official datasets-v3 shard is not a four-column annual table. Each exact form is one wide source record:

```text
ngram<TAB>year,match_count,volume_count<TAB>year,match_count,volume_count...
```

The tracked `.source.tsv` files preserve those exact official wide records. The tracked `.annual.tsv` files are deterministic derived expansions with this eight-column schema:

```text
ngram  year  match_count  volume_count  ngram_order  corpus_release  source_shard  wide_field_index
```

`wide_field_index` is the zero-based source tab-field index (`ngram` is field 0; observations start at field 1). The analyzer enforces a complete bidirectional bijection: every official wide observation must have exactly one annual row, every annual row must resolve to the identical wide tuple, and year and source-field indices must be unique. Exact field-zero equality is required; substring/fuzzy extraction is invalid.

Core retained records:

| Exact form | Order | Annual rows | Earliest retained year | Latest retained year |
| --- | ---: | ---: | ---: | ---: |
| `forever` | 1 | 430 | 1500 | 2019 |
| `for ever` | 2 | 457 | 1478 | 2019 |

The optional `forevermore` record has 301 annual rows from 1630–2019 and is not part of the core gate.

## Common word-token denominator

The complete fixed `totalcounts-1` object contains 529 records. Its actual range is 1470–2019, with 21 absent years inside that 550-year span. The release is sparse: the contract does not assume a 1500 lower bound or a continuous 520-row totals table.

For an explicit exact-form observation with a positive same-year total, contract B computes:

```text
appearances per million corpus word tokens
= exact-form yearly match_count / annual total 1-gram word tokens × 1,000,000
```

This means: the number of times one exact surface form appears as an n-gram per million corpus word tokens. It does not mean language-wide spelling adoption, semantic replacement, first use, a social acceptance event, or an unbiased population trend.

The generated typed artifact contains:

- 887 exact form-year rates with wide-field and annual-line lineage;
- 1,100 form-year coverage rows across the actual 1470–2019 totals range;
- 550 pair-year rows, with arithmetic null unless both core rates exist;
- for `forever`: 99 `absent_or_suppressed` form-years and 21 unavailable-denominator years;
- for `for ever`: 72 `absent_or_suppressed` form-years and 21 unavailable-denominator years.

There are no explicit zero-bearing core tuples in the retained records. Therefore `observedZeroYears=0`; an absent source tuple is never reclassified as zero.

## Viewer contract and sanity diagnostic

Contract A keeps the official Viewer fractions on separate denominators:

- `forever`: per million unigrams;
- `for ever`: per million bigrams.

Viewer values cannot support joined/spaced share, ratio, delta, crossover, overtaking year, or a shared generic frequency axis. Contract B's independently reconstructed word-token rates are the only current basis for shared-denominator pair arithmetic.

The Viewer/raw comparison is diagnostic and non-gating for both A and B. With both contracts available, 430 `forever` years were compared independently. The maximum absolute difference was about 0.000002513 appearances per million, within the preregistered 0.0001 tolerance. If B is unavailable, this diagnostic becomes `status=not_available`; it does not make A ineligible.

## Missingness policy

The generated schema provides at least these states:

- `observed_positive`;
- `observed_zero`;
- `absent_or_suppressed`;
- `not_searched`;
- `fetch_failed`;
- `unavailable`;
- `incomparable`;
- `out_of_scope`.

An explicit wide tuple with `match_count=0` may be `observed_zero`. A missing exact form-year is `absent_or_suppressed`, never silently zero. A missing same-year total is `unavailable`; the rate is null. Pair arithmetic is `incomparable` whenever either core rate is unavailable. No interpolation, extrapolation, endpoint padding, or silent fill is applied.

## Transform, checksum, timestamp, and rights boundaries

Contract B's exact active transform scope contains only:

1. `google-20200217-core-exact-form-extraction`;
2. `google-20200217-core-wide-to-annual-expansion`;
3. `google-20200217-totalcounts-freeze`.

Contract A's exact active scope contains only `google-20200217-viewer-freeze`. Optional-form transforms have their own scope. `legacy-variable-viewer-fetch` is `excluded_legacy` and cannot block either new contract.

Every active transform binds `scripts/acquire_forever_google_20200217.ts` by SHA-256. The acquisition script and transform manifest are themselves included in `checksums.json`; transform inputs/outputs bind byte counts and SHA-256. Each scoped transform ID must resolve exactly once, and each scoped input/output path set must be exact: expected paths cannot be omitted and optional/legacy paths cannot be added. Checksum descriptor uniqueness and rights overrides are also evaluated only for the figure's active paths, so unrelated legacy or optional rows do not leak into its gate.

Capture timestamps are acquisition provenance. They may change before a new freeze; they are excluded from derived research bytes. Byte stability applies to derivation over frozen checksum-bound inputs. Rights use dataset-level inheritance with item-level overrides permitted; an item override is not globally required when a valid dataset default applies.

## Other source layers and remaining page STOP

The existing non-Google layers remain audited but do not block a validated Google contract:

| Layer | Current observed inventory | Why its figure remains ineligible |
| --- | --- | --- |
| selected Gutenberg | 23 selected generated work records; 3,249,043 processed tokens; 332 occurrence-role rows | official raw text/edition/checksum/selection and passage-dedupe closure incomplete |
| attestation claims | 6 secondary claim rows | quotations/editions/date precision/primary provenance incomplete |
| modern capture | 10 query strings; 17 snippet rows; 16 unique URLs | raw search responses, zero-result state, revisions, three date types, and capture provenance incomplete |
| coverage | no complete cross-layer coverage manifest | cannot yet distinguish every source layer's searched/unsearched/unavailable states |

The values 23, 10, and 16 are observations of legacy generated inventories, not hard-coded global success constants. Each future figure must define its own source universe and active dependency closure.

Legacy heuristic/display arrays, manual coordinates, mixed-denominator flows, approximate date rails, 0–4 endpoint fields, independent shape-scale sparklines, the 1930–2024 decorative gap, and prose-derived source shapes remain excluded from research authority. They were not revived in this round.

## Generated artifacts and verification

- `src/data/generated/forever_analysis.json`: aggregate schema-2 audit, explicit Google outcome, A/B audit, typed rates/coverage/pairs, page authorization, gaps, assertions, and spot checks;
- `src/data/generated/forever_raw_data_manifest.json`: exhaustive byte manifest with source/rights/transform classifications;
- `src/data/generated/forever_findings_registry.json`: source-bound findings and derivation policies;
- `src/data/generated/forever_figure_contract_registry.json`: seven independent figure contracts and page authorization;
- `src/types/foreverAnalysis.ts`: typed schema consumed by the loader.

Generate with `npm run data:forever:audit`. Validate exact generated bytes with `npm run data:forever:audit:validate`. The analyzer includes 33 raw → derived → serialized spot checks, including exact shard identity, exact form equality, n-gram orders, first/last retained years, sparse absence, a positive low-count row, maximum match count, annual total lookup, manual and independent rate recomputations, joined/spaced separation, independent double derivation, Viewer release identity, raw → finding → contract lineage, non-core removal/core mutation, and exact-closure pollution tests for A and B.

The final round status remains:

```text
GOOGLE_COMMON_DENOMINATOR_CONTRACT_READY
pageImplementationAuthorized=false
READY_FOR_USER_VISUAL_ACCEPTANCE=false
```

This is not `FOREVER_COMPLETE`, `MOBILE_FOREVER_READY`, or `COMPLETE_FOR_SCOPE`.

# Artificial Collection Log

Generated: 2026-05-09T15:30:55.470Z

## Scripts

- `scripts/fetch_ngram_artificial.ts`

## Source Method

- Source: Google Books Ngram Viewer
- Endpoint: `https://books.google.com/ngrams/json`
- Output root: `docs/research/artificial`
- Corpus: `en` (English)
- Date range: 1800-2019
- Smoothing: 0
- Case-sensitive query: false
- Case-insensitive parameter: true
- Query batching: 8 terms per request, with single-term retry after batch failure

## Terms Attempted

### core_term

- artificial
- artificially
- artifice
- artificer
- synthetic
- fake
- man-made
- human-made
- machine-made
- simulated

### priority_phrase

- artificial light
- artificial flowers
- artificial teeth
- artificial limb
- artificial respiration
- artificial selection
- artificial insemination
- artificial silk
- artificial leather
- artificial sweetener
- artificial color
- artificial colour
- artificial intelligence
- artificial neural network
- artificial life
- artificial language

### secondary_phrase

- artificial day
- artificial heart
- artificial kidney
- artificial breeding
- artificial fertilization
- artificial incubation
- artificial feeding
- artificial rubber
- artificial fibre
- artificial fiber
- artificial flavor
- artificial flavour
- artificial ingredients
- artificial vision
- artificial consciousness
- artificial general intelligence
- artificial creativity
- artificial voice
- artificial companion
- artificial womb

### test_term

- artificial agent
- artificial image
- natural

## Terms Failed

- None

## Missing Terms

- man-made
- human-made
- machine-made

## Too Sparse Terms

- None

## Manual Fixes

- None. Values were written directly from the Ngram JSON time series into CSV rows.

## Assumptions

- The English corpus was used for the first pass, matching the user's preferred source setting and keeping the first-round dataset compact.
- Outputs are stored under `docs/research/artificial` to distinguish research data storage from the existing `data` word/page.
- Existing project precedent uses `smoothing=0`; this script follows that convention.
- Case-insensitive Ngram queries were used so capitalization variants such as title-case phrase uses are aggregated.
- For case-insensitive Ngram responses, `term (All)` aggregate rows are preferred over individual capitalization rows.
- A term with one to three nonzero years is marked `too_sparse`; a term with no returned row or no nonzero values is marked `missing`.
- Low-priority test terms were collected because the same workflow handled them cleanly.

## Request URLs

- https://books.google.com/ngrams/json?content=artificial%2Cartificially%2Cartifice%2Cartificer%2Csynthetic%2Cfake%2Cman-made%2Chuman-made&year_start=1800&year_end=2019&corpus=en&smoothing=0&case_insensitive=true
- https://books.google.com/ngrams/json?content=machine-made%2Csimulated&year_start=1800&year_end=2019&corpus=en&smoothing=0&case_insensitive=true
- https://books.google.com/ngrams/json?content=artificial+light%2Cartificial+flowers%2Cartificial+teeth%2Cartificial+limb%2Cartificial+respiration%2Cartificial+selection%2Cartificial+insemination%2Cartificial+silk&year_start=1800&year_end=2019&corpus=en&smoothing=0&case_insensitive=true
- https://books.google.com/ngrams/json?content=artificial+leather%2Cartificial+sweetener%2Cartificial+color%2Cartificial+colour%2Cartificial+intelligence%2Cartificial+neural+network%2Cartificial+life%2Cartificial+language&year_start=1800&year_end=2019&corpus=en&smoothing=0&case_insensitive=true
- https://books.google.com/ngrams/json?content=artificial+day%2Cartificial+heart%2Cartificial+kidney%2Cartificial+breeding%2Cartificial+fertilization%2Cartificial+incubation%2Cartificial+feeding%2Cartificial+rubber&year_start=1800&year_end=2019&corpus=en&smoothing=0&case_insensitive=true
- https://books.google.com/ngrams/json?content=artificial+fibre%2Cartificial+fiber%2Cartificial+flavor%2Cartificial+flavour%2Cartificial+ingredients%2Cartificial+vision%2Cartificial+consciousness%2Cartificial+general+intelligence&year_start=1800&year_end=2019&corpus=en&smoothing=0&case_insensitive=true
- https://books.google.com/ngrams/json?content=artificial+creativity%2Cartificial+voice%2Cartificial+companion%2Cartificial+womb&year_start=1800&year_end=2019&corpus=en&smoothing=0&case_insensitive=true
- https://books.google.com/ngrams/json?content=artificial+agent%2Cartificial+image%2Cnatural&year_start=1800&year_end=2019&corpus=en&smoothing=0&case_insensitive=true

## Unresolved Issues

- Ngram does not disambiguate senses, so all phrase-level interpretation requires later snippet or archive review.
- Rare phrases may fall below Ngram reporting thresholds.
- Google Books corpus updates, OCR, metadata, and language detection can change exact values.

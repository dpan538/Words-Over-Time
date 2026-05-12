# Chart 4 Source Notes

Generated: 2026-05-12T11:20:37.272Z

## Google Books Ngram

- Source: Google Books Ngram Viewer
- Endpoint: `https://books.google.com/ngrams/json`
- Corpus used: `en` (English)
- Date range: 1800-2019
- Smoothing: 0
- Case-insensitive: true

## Settings Used

The first-round Chart 4 package uses the same broad Ngram settings as earlier artificial passes unless a later project-level reason changes the settings.

## Limitations

- Book corpus bias: Ngram reflects printed-book frequency, not all language use.
- OCR and metadata issues can create false positives, false negatives, or dating noise.
- No sense disambiguation is available from the yearly time series.
- Phrase thresholding may hide rare or label-like phrases.
- Broad unigram ambiguity is especially high for `natural`, `real`, `false`, `fake`, `genuine`, and `authentic`.
- Packaging language may be underrepresented because it often appears in labels, ads, magazines, websites, and regulatory materials rather than books.
- Ngram cannot show sentiment directly; suspicion, insincerity, and pejoration need contextual evidence.

## Optional Non-Ngram Sources

- No optional non-Ngram sources were fetched in this round.

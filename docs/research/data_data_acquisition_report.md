# Data Data Acquisition Report

Generated: 2026-05-08T12:55:55.264Z

## Files Generated

- `src/data/generated/data_terms.json`
- `src/data/generated/data_frequency.json`
- `src/data/generated/data_phases.json`
- `src/data/generated/data_relations.json`
- `src/data/generated/data_sources.json`
- `src/data/generated/data_evidence.json`
- `src/data/generated/data_grammar_usage.json`
- `src/data/generated/data_coverage_report.json`
- `src/data/generated/data_dataset.json`
- `docs/research/data_ngram_summary.csv`
- `docs/research/data_data_acquisition_report.md`

## Scripts Used

- `scripts/fetch_data_ngram.ts`: generated curated term/source/phase/evidence/relation files, fetched Google Books Ngram data for English, American English, and British English, wrote the compact CSV, coverage report, grammar dataset, consolidated dataset, and this report.
- `scripts/validate_data_dataset.ts`: validates term slugs, relation endpoints, evidence/source references, branch values, confidence values, data layers, and major-node source/caveat coverage.

## Validation Result

`npm run data:data:validate` passed after generation.

- Terms validated: 46
- Sources validated: 27
- Evidence items validated: 29
- Relations validated: 37
- Warnings: 0
- Errors: 0

## Ngram Fetch Summary

- Terms requested: 46
- Corpora requested: en, en-US, en-GB
- Date range: 1800-2022
- Case-insensitive: true
- English term rows returned: 46/46
- Request errors: 0

## Sparse, Noisy, Or Missing English Rows

- Missing: none
- Sparse: none
- Noisy / requires manual review: data tabulation, computer data, digital data, machine-readable data, data base, data set, user data, search data, log data, big data, data-driven, labelled data, labeled data, synthetic data, datafication

## Strongest Available English Ngram Signals

- data: max 511.94422078 per million in 1983; quality ok
- database: max 47.92197591 per million in 1993; quality ok
- datum: max 32.4122604 per million in 1950; quality ok
- data base: max 25.64256185 per million in 1983; quality requires_manual_review
- dataset: max 22.14774575 per million in 2022; quality ok
- data processing: max 15.47766133 per million in 1978; quality ok
- big data: max 10.57630166 per million in 2021; quality requires_manual_review
- personal data: max 9.22171694 per million in 2008; quality ok
- data collection: max 8.07892532 per million in 2022; quality ok
- data set: max 7.10946917 per million in 2004; quality requires_manual_review
- census data: max 5.17027064 per million in 1993; quality ok
- metadata: max 4.59037847 per million in 2010; quality ok

## Coverage Summary

- Strong term coverage: 13
- Usable term coverage: 27
- Weak term coverage: 6
- Missing term coverage: 0
- Terms needing manual review: 34

## Data Layer Notes

- Raw: dictionary, legal, policy, historical, and source-backed evidence records.
- Computed: Ngram frequency series, period averages, thresholds, and coverage summaries.
- Curated: term inclusion, branch assignment, visual roles, and many compound-term visibility labels.
- Interpretive: phase model and semantic/infrastructure relation edges.

## Implementation Recommendation

- Chart 01: use `data_frequency.json` for a restrained baseline of `data`, `datum`, and selected high-signal compounds. Label Ngram as visibility evidence only.
- Chart 02: use `data_terms.json`, `data_phases.json`, and `data_coverage_report.json` for the compound emergence timeline. Keep first attestation separate from first strong visibility.
- Chart 03: use `data_relations.json`, `data_terms.json`, and `data_evidence.json` for the semantic branch network and infrastructure overlay. Mark curated/interpretive edges in UI metadata.

## Next Steps

- Manually review snippets for noisy compounds, especially `data base`, `data set`, `big data`, `data-driven`, `user data`, `search data`, `machine-readable data`, `training data`, `labelled data`, and `synthetic data`.
- Add COHA/COCA/NOW extraction where access allows, especially for grammar and recent platform/privacy/AI terms.
- Replace broad source placeholders with more specific technical URLs for synthetic data before final public copy.
- Decide which major nodes should be visible by default after reviewing the coverage file.

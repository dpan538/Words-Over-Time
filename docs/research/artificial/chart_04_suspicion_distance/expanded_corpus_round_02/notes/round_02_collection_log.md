# Round 02 Collection Log

Generated: 2026-05-12T11:56:05.670Z

## Scope

Expanded Chart 4 corpus pass for `artificial`. This pass reads the existing Chart 4 Ngram package, preserves it as the 1800-2019 baseline, and adds pre-1800, post-2019, regulatory, dictionary, newspaper, advertising, product-page, and clean-label source width.

No chart design, visualization, React, final chart copy, or final semantic claim was produced.

## Existing Baseline Read

- Existing folder: `docs/research/artificial/chart_04_suspicion_distance/`
- Existing metadata rows read: 140
- Existing availability group rows read: 7
- Existing non-Ngram queue rows read: 62
- Existing missing Ngram baseline terms: man-made, human-made, machine-made

## Ngram Policy

- Did not rerun the 140-term Chart 4 Ngram collection.
- Used existing 1800-2019 outputs as baseline only.
- No new Ngram query was necessary in this pass.

## Files Written

- `raw/round_02_pre_1800_dictionary_extracts.json`
- `raw/round_02_pre_1800_snippets.csv`
- `raw/round_02_historical_newspaper_snippets.csv`
- `raw/round_02_modern_2019_2026_snippets.csv`
- `raw/round_02_regulatory_sources.json`
- `raw/round_02_source_access_log.csv`
- `processed/round_02_evidence_table.csv`
- `processed/round_02_pre_1800_sense_status.csv`
- `processed/round_02_modern_2019_2026_term_status.csv`
- `processed/round_02_source_coverage_matrix.csv`
- `processed/round_02_manual_review_queue.csv`
- `processed/round_02_chart4_data_gap_summary.csv`
- `processed/round_02_combined_timeline_coverage.csv`
- `notes/round_02_collection_log.md`
- `notes/round_02_source_notes.md`
- `notes/round_02_pre_1800_findings.md`
- `notes/round_02_2019_2026_findings.md`
- `notes/round_02_non_ngram_findings.md`
- `notes/round_02_remaining_risks.md`
- `sources/round_02_source_urls.md`
- `scripts/README.md`

## Source Types Checked

- historical_dictionary
- modern_dictionary
- etymology_source
- book_snippet
- newspaper_snippet
- advertising_snippet
- web_snippet
- news_snippet
- regulatory_source
- corpus_result
- secondary_literature

## Main Assumptions

- Source diversity is more useful than volume for this pass.
- Snippets are context leads, not frequency evidence.
- Existing Ngram first nonzero years are not treated as attestations.
- Modern product pages are packaging-language evidence, but they can change.
- Regulatory sources define categories; they do not prove consumer suspicion.

## Access Problems

- OED was not accessible.
- Direct Johnson was not stabilized; existing indirect Johnson status was carried forward.
- Bailey was found as Google Books records/search-only, but no stable entry extract was captured.
- Ash, Sheridan, and Walker entries were not captured; they remain manual scan items.
- No balanced 2019-2026 corpus such as NOW/COCA/GDELT was queried in this pass.

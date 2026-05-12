# Round 03 Collection Log

Generated: 2026-05-12T12:35:01.159Z

## Scope

Focused Chart 4A detailed data and evidence pass for `artificial`.

This pass collects and evaluates evidence for negative, suspicious, and pejorative charge across historical domains. It does not design Chart 4, implement visualization, write React components, create final chart copy, build the page, or decide final visual structure.

## Existing Data Read

- read: `docs/research/artificial/chart_04_suspicion_distance/processed/chart_04_term_metadata.csv`
- read: `docs/research/artificial/chart_04_suspicion_distance/processed/chart_04_terms_requiring_non_ngram_sources.csv`
- read: `docs/research/artificial/chart_04_suspicion_distance/processed/chart_04_ngram_long.csv`
- read: `docs/research/artificial/chart_04_suspicion_distance/expanded_corpus_round_02/processed/round_02_evidence_table.csv`
- read: `docs/research/artificial/chart_04_suspicion_distance/expanded_corpus_round_02/processed/round_02_pre_1800_sense_status.csv`
- read: `docs/research/artificial/chart_04_suspicion_distance/expanded_corpus_round_02/processed/round_02_modern_2019_2026_term_status.csv`
- read: `docs/research/artificial/chart_04_suspicion_distance/expanded_corpus_round_02/processed/round_02_combined_timeline_coverage.csv`
- read: `docs/research/artificial/chart_04_suspicion_distance/expanded_corpus_round_02/notes/round_02_pre_1800_findings.md`
- read: `docs/research/artificial/chart_04_suspicion_distance/expanded_corpus_round_02/notes/round_02_2019_2026_findings.md`
- read: `docs/research/artificial/chart_04_suspicion_distance/expanded_corpus_round_02/notes/round_02_non_ngram_findings.md`
- read: `docs/research/artificial/chart_04_suspicion_distance/expanded_corpus_round_02/notes/round_02_remaining_risks.md`

## Missing Inputs

- None

## Ngram Handling

- Existing Chart 4 Ngram was used as the 1800-2019 baseline.
- The 140-term Ngram run was not repeated.
- Decade averages and max values were extracted for 22 priority terms.
- Ngram first visible years and frequencies are not treated as attestations or sense proof.

## Evidence Counts

- Priority Ngram decade rows: 484
- Pejoration evidence rows: 18
- Pre-1800 snippet/status rows: 6
- Historical advertising rows: 2
- Consumer transition rows: 4
- Modern 2019-2026 rows: 8
- Manual review items: 6

## Files Written

- `raw/round_03_ngram_decade_extract.csv`
- `raw/round_03_pre_1800_negative_snippets.csv`
- `raw/round_03_historical_advertising_snippets.csv`
- `raw/round_03_consumer_transition_snippets.csv`
- `raw/round_03_modern_2019_2026_snippets.csv`
- `raw/round_03_source_access_log.csv`
- `processed/round_03_pejoration_evidence_table.csv`
- `processed/round_03_domain_timeline.csv`
- `processed/round_03_decade_signal_summary.csv`
- `processed/round_03_domain_wave_summary.csv`
- `processed/round_03_negative_charge_scores.csv`
- `processed/round_03_burst_candidates.csv`
- `processed/round_03_spiral_trajectory_candidates.csv`
- `processed/round_03_manual_review_queue.csv`
- `processed/round_03_chart4a_readiness_matrix.csv`
- `notes/round_03_collection_log.md`
- `notes/round_03_source_notes.md`
- `notes/round_03_pejoration_findings.md`
- `notes/round_03_trajectory_interpretation.md`
- `notes/round_03_chart4b_connection_notes.md`
- `notes/round_03_remaining_risks.md`
- `sources/round_03_source_urls.md`
- `scripts/README.md`

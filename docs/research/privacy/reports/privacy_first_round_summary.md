# Privacy First-Round Research Summary (Layer Recovery Pass)

Generated: 2026-05-26T12:48:05Z  
Scope: recover and normalize first-round privacy research artifacts into modular, chart-number-free layers; keep raw evidence where possible.

## What was cleaned

- Removed chart-numbered namespace from active research artifacts by migrating historical artifacts into legacy folders:
  - `docs/research/privacy/raw/legacy_chart_runs/`
  - `docs/research/privacy/processed/legacy_chart_runs/`
  - `docs/research/privacy/reports/legacy_chart_runs/`
- Kept only layer-style active files in `docs/research/privacy/raw`, `processed`, and `reports` using these layer ids:
  - `frequency_terms`
  - `etymology_early_usage`
  - `collocations_semantic_field`
  - `attention_metrics`
  - `timeline_source_index`
- Updated preview layer refs to avoid `chart*_layer` keys in `src/data/generated/privacy_chart_data_preview.json`.

## What is collected now (successful fetches only)

- `frequency_terms`
  - 47 target terms/phrases
  - 3 source corpora
  - 141 collected series
  - year range: 1500–2022
  - 73,743 non-empty yearly cells (141 × 523)
- `etymology_early_usage`
  - 32 processed entries
  - root-family rows preserved (private/privy/privacy)
  - 27 medium confidence, 5 low confidence
- `collocations_semantic_field`
  - 89 phrases seeded and retained
  - 38 strong/usable signals
  - 29 weak or missing
  - 10 discovered follow-up terms retained
- `attention_metrics`
  - 11 Wikimedia pageview series recovered
  - 5 curated event anchors
  - total views (all series, all years): 14,621,041
- `timeline_source_index`
  - 19 timeline anchors
  - confidence split: 3 high, 8 medium, 8 low

## Direct evidence floor for naming

- Earliest related-root evidence retained: **1200** (`privy` root-family)
- Earliest direct `"privacy"` term evidence retained: **1400**
- Earliest legal-rights-oriented evidence: **1890** (Warren & Brandeis)

## Sources used / failed

- Successful core sources:
  - Google Books Ngram-style queries (network fetch succeeded for current run)
  - Wikimedia pageviews API
  - Historical dictionary pages (dictionary/e-tymology scraping for attestations; not all years are equally reliable)
- Unfetched / unavailable in this environment:
  - Google Trends (no stable official public API for this pipeline)
  - NOW Corpus (no reproducible free public export path currently used here)
  - COCA (no public API in this environment)

## Open risks

- Some etymology evidence includes extracted year candidates from dynamic/HTML sources and should be revalidated with stable archival snapshots.
- Early legal/history anchors are useful for timeline scaffolding but still need stronger citation-grade verification for final narrative work.
- The old chart-numbered artifacts are archived rather than deleted to preserve provenance.

## Scripts and process

- Current scripts are strictly modular (five layer scripts):
  - `scripts/scrape_privacy_frequency_terms.py`
  - `scripts/process_privacy_frequency_terms.py`
  - `scripts/scrape_privacy_etymology_early_usage.py`
  - `scripts/process_privacy_etymology_early_usage.py`
  - `scripts/scrape_privacy_collocations_semantic_field.py`
  - `scripts/process_privacy_collocations_semantic_field.py`
  - `scripts/scrape_privacy_attention_metrics.py`
  - `scripts/process_privacy_attention_metrics.py`
  - `scripts/scrape_privacy_timeline_source_index.py`
  - `scripts/process_privacy_timeline_source_index.py`
- All scripts are independent and create missing output directories when run.

## Recommended next steps (still exploratory)

1. Validate direct first-use evidence for `privacy` with at least one archival-grade lexical source (dictionary or historical corpus snapshot) before timeline locking.
2. Keep `legacy_chart_runs` as recovery logs; do not reintroduce chart order assumptions from them.
3. Add a provenance-aware citation export format for high-impact timeline anchors (especially 15th–20th century semantic shifts and 1890 legal turn).

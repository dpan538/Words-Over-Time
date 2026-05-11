# Hub Data Collection Report

Generated: 2026-05-11T23:30:05.780214Z

## What Was Collected

- Ngram terms attempted: 61
- Ngram terms collected: 59
- Phrase candidates: 59
- Snippet samples: 18
- Semantic categories: 6
- Timeline scaffold events: 12
- Failed/unavailable source layers: 4

## Sources Used

- Online Etymology Dictionary: collected
- Wiktionary: collected
- Merriam-Webster: collected
- Cambridge Dictionary: collected
- Collins Dictionary: failed (Cache-only mode: no cached response for this URL.); note: Live attempt returned HTTP 403 Forbidden; source preserved for manual review.
- Webster's Revised Unabridged Dictionary 1913: collected
- Wikipedia: collected
- Wikipedia: collected

Primary frequency source: Google Books Ngram Viewer, English corpus, 1800-2022, smoothing 0, case-insensitive aggregate rows where available.

Historical snippet sources: loc.gov Chronicling America OCR descriptions, Google Books API textSnippets, Internet Archive full-text files, attempted legacy Chronicling America OCR search, plus short paraphrased reference snippets from dictionary/etymology sources. OCR/text snippets are review candidates, not final copy.

## Corpus Source Status

- Legacy Chronicling America API: failed_or_unavailable; 0 snippets; 22 query errors; 44 access failures; sample: Cache-only mode: no cached response for this URL.; note: Live attempts returned HTTP 404 from the legacy chroniclingamerica.loc.gov search endpoint; loc.gov search was used instead.
- loc.gov Chronicling America search: partial; 7 snippets; 4 query errors; 4 access failures; sample: Cache-only mode: no cached response for this URL.
- Internet Archive: partial; 2 snippets; 0 query errors; 0 access failures
- Google Books API: failed_or_unavailable; 0 snippets; 47 query errors; 94 access failures; sample: Cache-only mode: no cached response for this URL.; note: Live attempts returned HTTP 429 rate limiting; no Google Books snippets were collected in this pass.

## Scripts Created

- `scripts/scrape_hub_data.py`: fetches/caches Ngram, reference-source status, phrase candidates, and snippet candidates.
- `scripts/process_hub_data.py`: normalizes raw data into processed JSON, chart-preview JSON, and this report.

## How To Rerun

```bash
python3 scripts/scrape_hub_data.py
python3 scripts/process_hub_data.py
```

## Reliable Data

- The core `hub` and `hubs` Ngram lines are strong frequency baselines.
- Mechanical phrases such as `wheel hub`, `hub cap`, and `hubcap` preserve the older physical sense.
- Transport, institutional, network, and digital phrases are useful as trend candidates when paired with snippets.
- Dictionary-source records are paraphrased sense inventories and access logs, not polished definitions.

## Sparse Or Uncertain Data

- server hub: too_sparse; Ngram signal is sparse; keep as a candidate but avoid interpretation without snippets.
- platform hub: too_sparse; Ngram signal is sparse; keep as a candidate but avoid interpretation without snippets.

## Promising Phrases For Later Visualization

- wheel hub (mechanical_core): peak 0.24601964 per million in 1872; ok
- hub-and-spoke (network_system): peak 0.15271277 per million in 2016; requires_manual_review
- rear hub (mechanical_core): peak 0.07820091 per million in 1906; ok
- transportation hub (transport_logistics): peak 0.07190989 per million in 2008; ok
- transport hub (transport_logistics): peak 0.06270535 per million in 2010; ok
- hubcap (mechanical_core): peak 0.05755242 per million in 2014; ok
- financial hub (institutional_cluster): peak 0.04079248 per million in 2006; requires_manual_review
- hub of activity (central_place): peak 0.03413241 per million in 2011; ok
- network hub (network_system): peak 0.02438265 per million in 1999; requires_manual_review
- hub of the city (central_place): peak 0.02214391 per million in 1954; ok
- railway hub (transport_logistics): peak 0.01016971 per million in 2022; ok
- airline hub (transport_logistics): peak 0.00809336 per million in 2016; sparse
- hub of commerce (central_place): peak 0.00705695 per million in 1942; sparse
- education hub (institutional_cluster): peak 0.2307503 per million in 2022; requires_manual_review

## Supported Semantic Categories

- Mechanical Core: strong support; 8 phrases; 4 snippets
- Central Place: moderate support; 7 phrases; 6 snippets
- Transport & Logistics: strong support; 11 phrases; 4 snippets
- Network System: strong support; 14 phrases; 2 snippets
- Institutional Cluster: strong support; 10 phrases; 2 snippets
- Digital Platform: moderate support; 9 phrases; 0 snippets

## Outputs

- `docs/research/hub/processed/hub_frequency_series.json`
- `docs/research/hub/processed/hub_phrase_series.json`
- `docs/research/hub/processed/hub_semantic_categories.json`
- `docs/research/hub/processed/hub_timeline_events.json`
- `docs/research/hub/processed/hub_snippet_samples.json`
- `docs/research/hub/processed/hub_chart_data_preview.json`
- `src/data/generated/hub_chart_data_preview.json`
- `docs/research/hub/reports/hub_data_collection_report.md`
- `docs/research/hub/reports/hub_data_collection_report.json`

## Suggested Next Research Questions

- Which early central-place snippets are strong enough to separate Boston-style civic hub from generic 'center' language?
- When does transport hub become stronger than railroad/railway hub in printed-book visibility?
- Which hub-and-spoke evidence belongs to transport systems versus computing/network architecture?
- Which modern phrases are meaningful for the future page: data hub, content hub, innovation hub, or digital hub?
- Can COHA/COCA/NOW or another contemporary corpus validate recent platform and institutional uses better than books?

## Limitations

- This is a data pass only; no final chart choice or narrative copy is implied.
- Ngram is not sense-disambiguated and may surface early noisy phrase hits.
- Google Books, Internet Archive, and Chronicling America OCR/text snippets need source verification before final use.
- Modern digital/platform language probably needs contemporary corpus or web evidence beyond books.

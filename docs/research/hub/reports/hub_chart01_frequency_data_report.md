# Hub Chart 01 Frequency Data Report

Generated: 2026-05-13T08:02:15.592227Z

## Purpose

This pass only collected and preprocessed semantic-frequency proxies for Chart 01. It does not produce visualisation, layout, or final chart copy.

## Sources Used

- docs/research/hub/processed/hub_frequency_series.json
- docs/research/hub/processed/hub_phrase_series.json
- docs/research/hub/processed/hub_snippet_samples.json
- Targeted Google Books Ngram gap queries cached under docs/research/hub/raw/chart01_frequency_cache

## Query Groups

- `total_background`: hub, hubs
- `mechanical_core`: wheel hub, hub of a wheel, hub of the wheel, wheel-hub, axle hub, front hub, rear hub, bicycle hub, hubcap, hub cap, hub assembly
- `central_place`: hub of activity, hub of commerce, hub of trade, hub of industry, commercial hub, social hub, city hub, urban hub
- `transport_routing`: transport hub, transit hub, railway hub, railroad hub, airport hub, airline hub, shipping hub, logistics hub, regional hub, global hub, hub and spoke, hub-and-spoke, hub spoke, hub spoke system
- `network_system`: network hub, communication hub, hub node, Ethernet hub, internet hub, telecom hub, server hub, USB hub, switching hub
- `institutional_cluster`: business hub, financial hub, education hub, research hub, knowledge hub, innovation hub, startup hub, creative hub, cultural hub
- `digital_platform`: digital hub, content hub, data hub, resource hub, learning hub, media hub, platform hub, community hub, online hub

## Period Filtering

- `p1_pre_1850`: Before 1850 (1500-1849)
- `p2_1850_1899`: 1850-1899 (1850-1899)
- `p3_1900_1945`: 1900-1945 (1900-1945)
- `p4_1946_1979`: 1946-1979 (1946-1979)
- `p5_1980_1999`: 1980-1999 (1980-1999)
- `p6_2000_2009`: 2000-2009 (2000-2009)
- `p7_2010_2019`: 2010-2019 (2010-2019)
- `p8_2020_2022`: 2020-2022 (2020-2022)

The available Ngram series begins at 1800, so `p1_pre_1850` is effectively 1800-1849 for this layer. The current Ngram corpus available in this dataset ends at 2022, so the final bucket is limited to 2020-2022 rather than 2020-present.

## Processing Method

- Query-level series are preserved for every query.
- Group-level aggregation stores sum, mean, max query value, active query count, normalized group value, and share against total hub/hubs where possible.
- Normalization is within each semantic group, not across all meanings.
- The visibility index ranks semantic groups by period as a preprocessing aid only.
- Quality flags separate trend-ready queries from sparse, ambiguous, noisy, or failed queries.

## Preliminary Data Observations

- Mechanical-core queries remain present in the modern bucket with status 'backgrounded'.
- The strongest early-period group is mechanical_core in the visibility index.
- The strongest modern-period groups are institutional_cluster, transport_routing, central_place.

## Observations Requiring Caution

- Group sums combine semantic proxies and should not be read as exact sense counts.
- Regional hub, global hub, cultural hub, and community hub are ambiguous without context.
- Hubcap and hub cap are related mechanical compounds, not identical to hub itself.
- Modern digital/platform terms are often sparse before 2000.

## Not Supported By Data

- The data does not support saying the mechanical sense disappeared.
- The data does not support treating raw Ngram first appearance as a first attestation.
- The data does not prove that all centrality/control interpretations are lexical facts.

## Limitations

- Ngram values are printed-book frequency signals, not semantic proof.
- Queries are semantic proxies and may contain ambiguous or mixed senses.
- Missing or sparse query rows are preserved with explicit status flags.
- The available Ngram series begins at 1800; the pre-1850 bucket is effectively 1800-1849.
- Group sums are proxy aggregates, not direct sense counts.
- Mechanical-adjacent compounds are retained at query level and flagged separately.
- Search visibility records are existing-cache signals, not stable search counts.
- The Ngram corpus currently ends at 2022, so the final bucket is 2020-2022.

## Recommended Use For Chart 01

- `main_trend_layer`: wheel hub, hub of the wheel, front hub, rear hub, transport hub, hub and spoke, hub-and-spoke
- `supporting_layer`: hub, hubs, hub of a wheel, axle hub, bicycle hub, hub of activity, commercial hub, social hub, city hub, transit hub, railway hub, railroad hub, logistics hub, regional hub, global hub, network hub, communication hub, hub node, Ethernet hub, switching hub, business hub, financial hub, education hub, research hub, knowledge hub, creative hub, cultural hub, digital hub, data hub, learning hub, media hub, community hub
- `annotation_only`: hubcap, hub cap, hub assembly, hub of commerce, hub of trade, hub of industry, urban hub, airport hub, airline hub, shipping hub, hub spoke, internet hub, telecom hub, server hub, USB hub, innovation hub, startup hub, content hub, resource hub, platform hub, online hub
- `exclude`: wheel-hub, hub spoke system

## Outputs

- `docs/research/hub/processed/hub_chart01_semantic_frequency_series.json`
- `docs/research/hub/processed/hub_chart01_frequency_by_period.json`
- `docs/research/hub/processed/hub_chart01_semantic_visibility_index.json`
- `docs/research/hub/processed/hub_chart01_query_quality_flags.json`
- `docs/research/hub/processed/hub_chart01_frequency_summary.json`
- `docs/research/hub/reports/hub_chart01_frequency_data_report.md`
- `docs/research/hub/reports/hub_chart01_frequency_data_report.json`
- `src/data/generated/hub_chart_data_preview.json`

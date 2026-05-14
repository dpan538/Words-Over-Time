# Hub Chart 02 Routing Data Report

## Purpose

This pass supports Chart 02 data planning only. It consolidates routing, transfer, hub-and-spoke, transport, logistics, communication, and network terms for the working direction "The Transfer Model." It does not implement visualisation or final chart copy.

## Chart 02 Context

Chart 01 already handled semantic survival and backgrounding. Chart 02 instead asks how "hub" becomes a structure for collecting, redirecting, and redistributing flows. The data distinguishes simple central-place language from routing, transfer, distribution, and network-node language.

## Sources Used

- `docs/research/hub/processed/hub_frequency_series.json`
- `docs/research/hub/raw/hub_chart01_frequency_raw.json`
- `docs/research/hub/processed/hub_snippet_samples.json`
- `docs/research/hub/processed/hub_earliest_attestations.json`
- `docs/research/hub/processed/hub_timeline_events.json`
- Targeted Google Books Ngram gap requests where local cache did not already contain a routing query.

## Routing Layers

| Layer | Query count |
|---|---:|
| rail_transit_route | 12 |
| air_logistics_route | 12 |
| hub_and_spoke_model | 12 |
| network_communication_route | 13 |
| institutional_route_language | 5 |

## Frequency Preprocessing

Query-level yearly series are preserved. Routing-layer summaries aggregate query means, sums, max query values, active query counts, period ranks, and quality flags. Period buckets match Chart 01, with the first bucket effectively 1800-1849 and the final bucket 2020-2022.

Query status counts: {'success': 28, 'failed': 26}. Missing gap requests are kept as failed rows; no replacement data was fabricated.

## Evidence Collection

Evidence items collected: 21.

Confidence counts: {'medium': 15, 'high': 3, 'low': 3}.

Evidence was filtered toward routing, transfer, distribution, and network-node contexts. Ngram-only evidence is labelled as a frequency signal, not a first attestation.

## Preliminary Findings

- Hub-and-spoke status: strong enough for main model.
- Strongest early routing layer: `air_logistics_route (sparse signal only)`.
- Strongest modern routing layer: `hub_and_spoke_model`.
- Transport/logistics terms provide usable trend signals, but some older rail terms remain sparse or OCR-dependent.
- Network/communication terms appear as later technical extensions and should be separated from general institutional centrality.
- Regional/global/international hub remain ambiguous without context.

## Quality Flags

{'strong_trend': 1, 'usable_trend': 10, 'failed': 26, 'sparse_presence': 6, 'ambiguous_sense': 9, 'core_model': 2}

## Recommended Use For Chart 02

- Main model terms: hub and spoke, hub-and-spoke
- Main series terms: transport hub
- Supporting terms: transit hub, railway hub, railroad hub, logistics hub, network hub, communication hub, hub node, Ethernet hub, switching hub, USB hub
- Annotation terms: airport hub, airline hub, shipping hub, regional hub, global hub, telecom hub, internet hub, data hub, server hub, digital hub, platform hub, resource hub, knowledge hub, learning hub, business hub
- Exclude terms: rail hub, bus hub, metro hub, urban transit hub, route hub, passenger hub, intermodal hub, central station hub, air hub, distribution hub, cargo hub, freight hub, supply chain hub, international hub, hub and spokes, hub-spoke, spoke and hub, spoke-hub, hub-and-spoke system, hub and spoke system, hub-and-spoke network, hub and spoke network, hub-and-spoke model, hub and spoke model, network switch hub, service hub

## Data Cautions

- Ngram is printed-book frequency, not semantic proof.
- Group sums are proxies, not exact sense counts.
- Search visibility is not treated as exact frequency.
- Ambiguous terms need context before supporting a routing claim.
- The final Ngram bucket ends at 2022.
- First Ngram appearance is not first historical attestation.

## Next Step

Chart 02 is ready for visual planning with careful wording. The strongest anchor is hub-and-spoke as explicit model language, supported by transport/logistics and network/communication frequency proxies. Further scraping is optional, not required, unless the chart needs earlier direct textual quotations for specific routing terms.

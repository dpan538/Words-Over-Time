# Hub Chart 02 Data Recovery Report

## Purpose

This is a recovery and evidence-hardening pass only. It does not implement UI, React, Three.js, visualisation, layout, or final chart copy.

## Starting Point

The previous Chart 02 pass attempted 54 queries: 28 succeeded and 26 failed because network/DNS access was unavailable for uncached Ngram gap requests. It produced 21 evidence items and already found hub-and-spoke strong enough for the main model.

## Failed Query Triage

| Query | Layer | Previous failure | Triage | Action | Result |
|---|---|---|---|---|---|
| rail hub | rail_transit_route | URLError: [Errno 8] nodename nor servname provided, or not known | evidence_only | Frequency is not essential; retain only if later evidence supports it. | evidence_only |
| bus hub | rail_transit_route | URLError: [Errno 8] nodename nor servname provided, or not known | evidence_only | Frequency is not essential; retain only if later evidence supports it. | evidence_only |
| metro hub | rail_transit_route | URLError: [Errno 8] nodename nor servname provided, or not known | evidence_only | Frequency is not essential; retain only if later evidence supports it. | evidence_only |
| urban transit hub | rail_transit_route | URLError: [Errno 8] nodename nor servname provided, or not known | evidence_only | Frequency is not essential; retain only if later evidence supports it. | evidence_only |
| route hub | rail_transit_route | URLError: [Errno 8] nodename nor servname provided, or not known | evidence_only | Frequency is not essential; retain only if later evidence supports it. | evidence_only |
| passenger hub | rail_transit_route | URLError: [Errno 8] nodename nor servname provided, or not known | evidence_only | Frequency is not essential; retain only if later evidence supports it. | evidence_only |
| intermodal hub | rail_transit_route | URLError: [Errno 8] nodename nor servname provided, or not known | retry_frequency | Network/cache failure only; retry a targeted Ngram request if possible. | recovered |
| central station hub | rail_transit_route | URLError: [Errno 8] nodename nor servname provided, or not known | evidence_only | Frequency is not essential; retain only if later evidence supports it. | evidence_only |
| air hub | air_logistics_route | URLError: [Errno 8] nodename nor servname provided, or not known | evidence_only | Frequency is not essential; retain only if later evidence supports it. | evidence_only |
| distribution hub | air_logistics_route | URLError: [Errno 8] nodename nor servname provided, or not known | retry_frequency | Network/cache failure only; retry a targeted Ngram request if possible. | recovered |
| cargo hub | air_logistics_route | URLError: [Errno 8] nodename nor servname provided, or not known | retry_frequency | Network/cache failure only; retry a targeted Ngram request if possible. | recovered |
| freight hub | air_logistics_route | URLError: [Errno 8] nodename nor servname provided, or not known | retry_frequency | Network/cache failure only; retry a targeted Ngram request if possible. | recovered |
| supply chain hub | air_logistics_route | URLError: [Errno 8] nodename nor servname provided, or not known | retry_frequency | Network/cache failure only; retry a targeted Ngram request if possible. | recovered |
| international hub | air_logistics_route | URLError: [Errno 8] nodename nor servname provided, or not known | ambiguous_or_noisy | Ambiguous without context; do not use as routing frequency evidence. | evidence_only |
| hub and spokes | hub_and_spoke_model | URLError: [Errno 8] nodename nor servname provided, or not known | drop_or_exclude | Malformed, reversed, or redundant variant with no current evidence need. | dropped |
| hub-spoke | hub_and_spoke_model | URLError: [Errno 8] nodename nor servname provided, or not known | drop_or_exclude | Malformed, reversed, or redundant variant with no current evidence need. | dropped |
| spoke and hub | hub_and_spoke_model | URLError: [Errno 8] nodename nor servname provided, or not known | drop_or_exclude | Malformed, reversed, or redundant variant with no current evidence need. | dropped |
| spoke-hub | hub_and_spoke_model | URLError: [Errno 8] nodename nor servname provided, or not known | drop_or_exclude | Malformed, reversed, or redundant variant with no current evidence need. | dropped |
| hub-and-spoke system | hub_and_spoke_model | URLError: [Errno 8] nodename nor servname provided, or not known | retry_frequency | Network/cache failure only; retry a targeted Ngram request if possible. | failed_again |
| hub and spoke system | hub_and_spoke_model | URLError: [Errno 8] nodename nor servname provided, or not known | retry_frequency | Network/cache failure only; retry a targeted Ngram request if possible. | recovered |
| hub-and-spoke network | hub_and_spoke_model | URLError: [Errno 8] nodename nor servname provided, or not known | retry_frequency | Network/cache failure only; retry a targeted Ngram request if possible. | failed_again |
| hub and spoke network | hub_and_spoke_model | URLError: [Errno 8] nodename nor servname provided, or not known | retry_frequency | Network/cache failure only; retry a targeted Ngram request if possible. | recovered |
| hub-and-spoke model | hub_and_spoke_model | URLError: [Errno 8] nodename nor servname provided, or not known | retry_frequency | Network/cache failure only; retry a targeted Ngram request if possible. | failed_again |
| hub and spoke model | hub_and_spoke_model | URLError: [Errno 8] nodename nor servname provided, or not known | retry_frequency | Network/cache failure only; retry a targeted Ngram request if possible. | recovered |
| network switch hub | network_communication_route | URLError: [Errno 8] nodename nor servname provided, or not known | drop_or_exclude | Malformed, reversed, or redundant variant with no current evidence need. | dropped |
| service hub | institutional_route_language | URLError: [Errno 8] nodename nor servname provided, or not known | ambiguous_or_noisy | Ambiguous without context; do not use as routing frequency evidence. | evidence_only |

## Frequency Recovery

- Frequency series recovered: 8
- Recovered from existing cache: 0
- Recovered by Ngram retry: 8
- Failed again: 3
- Marked evidence-only: 10
- Dropped/excluded: 5

No missing frequency values were invented.

## Evidence Hardening

- Previous confidence: high=3, medium=15, low=3
- Hardened confidence: high=4, medium=14, low=3
- Hardened evidence items: 21

The 1943 railway hub direct evidence was upgraded because the dated text clearly supports a route-control sense. Low-confidence Ngram-only signals were retained as visibility signals, not as attestations.

## Routing Model Confidence

| Layer | Frequency support | Evidence support | Recommended role | Confidence | Notes |
|---|---|---|---|---|---|
| rail_transit_route | strong | strong | main_series | high |  |
| air_logistics_route | usable | strong | supporting | medium |  |
| hub_and_spoke_model | strong | usable | core_model | high |  |
| network_communication_route | usable | strong | supporting | medium |  |
| institutional_route_language | usable | absent | annotation | low | Use failed or ambiguous query variants only as cautions. |

## Remaining Gaps

- Expanded hub-and-spoke variants still lack recovered frequency series. (low): Core terms hub and spoke / hub-and-spoke remain available and strong enough for the model.

## Final Recommendation

Chart 02 readiness after recovery: **ready**. The core transfer model can proceed to visual planning with careful wording. Extra scraping is optional only if the chart needs primary-source quotations for expanded hub-and-spoke variants or distribution/cargo subterms.

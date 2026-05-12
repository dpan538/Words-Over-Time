# Hub Etymology And Attestation Report

Generated: 2026-05-12T00:10:31.251336Z

## Summary

- Added a separate etymology/attestation layer for `hub`.
- Attestation candidates: 22
- Confidence counts: high 0, medium 21, low 1
- Etymology/reference sources collected: 10/11
- Semantic shift groups: 6

## Earliest Overall Evidence

- Earliest claimed year: 1640s
- Earliest directly supported year in this layer: 1828
- Earliest direct corpus snippet year in this layer: 1908
- Earliest sense: Mechanical wheel center

Dictionary dates and reference dates remain labelled as claims unless backed by visible dated text.

## Etymology

Status: uncertain

Public etymology sources agree that the earliest sense is the solid center of a wheel, but they frame the ultimate origin as uncertain or only probably connected with hob/hubbe.

Possible origin theories:

- Unknown origin; possibly from earlier hubbe with a lump/protuberance sense related to hob. Source: Online Etymology Dictionary; Wiktionary; confidence: medium.
- Probably an alteration of hob. Source: Merriam-Webster; confidence: medium.

Related terms:

- nave: Older/alternate term for the central part of a wheel. Nave has Old English/Germanic roots and remains a synonym in historical dictionary entries for hub.
- hob: Possible source or related form in hub etymology. Mentioned in dictionary/etymology sources, but origin is still treated as uncertain.
- hubcap: Mechanical compound formed from hub plus cap. Etymonline dates hubcap/hub cap to 1896; Merriam-Webster lists 1903.

## Sense-By-Sense Earliest Evidence

| Sense | Earliest claimed year | Earliest supported year | Evidence quality | Notes |
|---|---:|---:|---|---|
| Mechanical wheel center | 1640s | 1828 | direct_needs_review | Earliest supported dated source is 1828; earliest direct corpus snippet is 1938. |
| Central place or focus | 1858 | 1910 | direct_needs_review | Earliest supported dated evidence in this layer is 1910. |
| Transport and logistics node | 1980 | 1908 | direct_needs_review | Earliest supported dated evidence in this layer is 1908. |
| Communication, computing, or network node |  |  | not_found | No usable earliest attestation found in this pass. |
| Institutional, economic, cultural, or knowledge cluster |  | 1908 | direct_needs_review | Earliest supported dated evidence in this layer is 1908. |
| Digital, content, data, or resource platform |  |  | not_found | No usable earliest attestation found in this pass. Digital/platform senses need contemporary corpus validation beyond Ngram. |

## Important Semantic Shifts

- mechanical_core -> central_place (1850s): partial. Etymonline dates the center-of-interest/activity sense to Holmes in 1858; primary text should be independently checked.
- central_place -> transport_logistics (early 20th century in current evidence): partial. Current direct snippets include transit hub in 1908, railway hub in 1943, and transportation hub in 1955; earlier Ngram signals remain unverified.
- transport_logistics -> network_system (late 20th century): uncertain. Hub-and-spoke has a Merriam-Webster 1980 dictionary claim; network/computing direct attestations still need better corpus evidence.
- network_system -> digital_platform (web/platform era): uncertain. First-pass Ngram signals exist for digital/content/data hub, but this pass did not find strong direct early snippets.

## Source Limitations

- Collins Dictionary: failed (Live attempts returned HTTP 403 Forbidden; source preserved for manual review.)
- Google Books API: skipped (First pass hit HTTP 429; second pass did not retry aggressively.)
- OCR/search result snippets: limited (LOC and Internet Archive evidence needs page/image verification before final chart copy.)

## Recommended Next Chart Implications

- A first chart can anchor hub in the physical wheel center before any platform or tech use.
- A transfer-model chart can show wheel to city to transport to network to platform.
- Compound growth can compare wheel hub, transport hub, network hub, innovation hub, and data hub.
- A centrality chart can separate movement/access from control/concentration.

## Outputs

- `docs/research/hub/processed/hub_etymology_summary.json`
- `docs/research/hub/processed/hub_earliest_attestations.json`
- `docs/research/hub/processed/hub_semantic_shift_attestations.json`
- `docs/research/hub/processed/hub_attestation_confidence_matrix.json`
- `docs/research/hub/reports/hub_etymology_attestation_report.md`
- `docs/research/hub/reports/hub_etymology_attestation_report.json`
- `src/data/generated/hub_chart_data_preview.json`

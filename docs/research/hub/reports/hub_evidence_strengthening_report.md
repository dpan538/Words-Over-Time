# Hub Evidence Strengthening Report

Generated: 2026-05-12T01:14:20.927632Z

## Summary

- Third pass focus: strengthen early evidence quality for `hub`, especially before 1908.
- New strengthened attestations: 6
- Confidence counts: high 4, medium 2, low 0
- Previous direct corpus/text year: 1908
- New earliest direct text year: 1858
- 1640s claim resolved to primary quotation: False
- 1828 evidence clarified: True
- Nave relation supported: True

## 1640s Claim Investigation

The 1640s date is visible in the Online Etymology Dictionary, and Merriam-Webster lists 1649 as first known use. In this pass, neither public page exposed a primary quotation, author/title, or dated source for the 1640s/1649 claim. The date should remain labelled as `dictionary_claim`.

## 1828 Evidence Investigation

The 1828 evidence is a historical dictionary entry in Noah Webster's *An American Dictionary of the English Language*. The source is dated and readable, and it supports the mechanical wheel-center sense, but it is not direct non-dictionary corpus evidence.

## Pre-1908 Direct Evidence

| Year | Term/Phrase | Sense | Source | Evidence Type | Confidence | Notes |
|---:|---|---|---|---|---|---|
| 1858 | hub | Central place or focus | The Autocrat of the Breakfast-Table | direct_text | high | Project Gutenberg text confirms the passage; first-edition page verification would further strengthen publication details. |
| 1878 | wheel hub | Mechanical wheel center | London Bicycle Club Gazette | direct_text | medium | OCR heading appears partly garbled around 'Front'; image verification is recommended before publication. |
| 1881 | hub | Mechanical wheel center | A Bicycle Tour in England and Wales | direct_text | high | Google-scanned IA OCR; page image should be checked before final quotation. |
| 1884 | hubs | Mechanical wheel center | Wright & Ditson's Annual Illustrated Catalogue | direct_text | high | Catalogue OCR is readable; verify page image for final quotation. |

## Mechanical Vs Metaphorical Evidence

Mechanical evidence is now stronger before 1908: this pass found direct-text cycling sources in 1878, 1881, and 1884, with the 1881 and 1884 examples especially readable. Metaphorical evidence is also stronger: the Holmes `hub of the solar system` passage was verified in a public-domain Project Gutenberg text for the 1858 work.

## Nave Relationship

Nave is historically relevant as the older/formal wheel-center term. The useful cautious claim is that early dictionary sources explain hub through nave; Johnson/Todd/Chalmers 1828 also notes provincial usage for hub/hob. This supports a later chart note, but not a broad origin story without stronger OED or early-modern primary quotations.

## Remaining Limitations

- The 1640s/1649 first-use dates still lack visible public quotations.
- OED or paywalled historical dictionary quotation evidence was not accessible in the local environment.
- LOC newspaper search can produce useful leads, but OCR/page access remained unreliable and was not promoted into strengthened evidence.
- Google Books API was not retried because earlier passes encountered rate limiting.
- Internet Archive OCR is useful but should be checked against page images before final chart copy.

## Chart Implications

- Chart 1 can safely begin with the physical wheel/mechanical hub, but 1640s should be displayed as a claim rather than confirmed text date.
- The early metaphor layer is now better supported by Holmes 1858 direct text.
- Nave vs hub is worth a small contextual note, not a standalone origin argument.
- Mechanical direct-text evidence before 1908 is now available for later chart planning.

## Outputs

- `docs/research/hub/processed/hub_strengthened_attestations.json`
- `docs/research/hub/processed/hub_evidence_quality_upgrade.json`
- `docs/research/hub/processed/hub_nave_relation_summary.json`
- `docs/research/hub/reports/hub_evidence_strengthening_report.md`
- `docs/research/hub/reports/hub_evidence_strengthening_report.json`
- `src/data/generated/hub_chart_data_preview.json`

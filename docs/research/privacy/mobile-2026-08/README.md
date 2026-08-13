# Privacy mobile evidence package

Status: predesign evidence only. Page implementation is not authorized by this package.

## Reproduce

```bash
npm run data:privacy:mobile
npm run data:privacy:mobile:validate
```

The deterministic transform is `scripts/build_privacy_mobile_analysis.ts`. It reads only frozen repository inputs and performs no network access. It writes the same byte-stable artifact to:

- `docs/research/privacy/mobile-2026-08/privacy_mobile_analysis.json` — research and contract artifact;
- `docs/research/privacy/mobile-2026-08/privacy_mobile_cleaned_backup.json` — independent processed-data backup;
- `src/data/generated/privacy_mobile_analysis.json` — future typed render-consumer artifact.

The artifact contains the active-input manifest and SHA-256 checksums, cleaned records, exclusions, findings, five figure contracts, the eight-state missingness taxonomy and raw-to-derived spot checks.

## Active evidence boundary

- Wikimedia Pageviews: ten registered English Wikipedia pages with a common complete 2018–2025 window. The coverage-incomplete GDPR page and partial 2026 capture are excluded rather than zero-filled.
- Policy/interface language: exact adjacent-token counts in five frozen pages that pass a 1,000-visible-token content floor. Three thin or blocked captures are marked `absent_or_suppressed`, not zero.
- Institutional ledger: seventeen anchors with `confidence=high`, `manual_review=false`, and a reachable HTTP 2xx source.

## Excluded from production claims

- variable Google Books Ngram aliases and early sparse tails;
- mixed OpenAlex/GDELT geography described as attention;
- elevation as a privacy explanation;
- probabilistic radiation routes;
- unverified first-use claims;
- medium/low-confidence or manual-review institutional anchors;
- legacy chart arrays and visual metaphors.

These source layers remain in the repository as historical research. Exclusion from this mobile story does not delete or invalidate the underlying evidence for other properly bounded uses.

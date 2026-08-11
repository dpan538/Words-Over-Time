# Mobile Home / About / Forever rebuild evidence

Audit date: 2026-08-11

Baseline branch/HEAD: `audit/mobile-search-growth-2026-08` / `33bc7ab2acadd25d134d2d87433318423e8c9ef0`

Formal data outcome: `STOP_RAW_DATA_MISSING`

This directory is partial evidence, not visual acceptance. The in-app Browser backend became unavailable after the listed captures and rejected the production-server URL; the tool explicitly prohibited a fallback to another browser/port. Missing final screenshots and production console runs are recorded as missing, not inferred as passing.

## Evidence present

- `baseline/`: 390/430 full-page Home, About, and Forever captures plus valid 1440×900 baselines. The invalid blank About JPEG was removed; the committed-source PNG remains.
- `after/after-home-1440x900.jpg` and `after/after-forever-1440x900.jpg`: byte-identical desktop visual captures against their baselines.
- `after/after-about-1440x900.jpg`: desktop extraction capture; source review found only wrapper, `d-` ID, and semantic-H1 changes.
- `after/after-home-panel-two-390x844.jpg`: second Home field before the final no-route label collision correction; do not treat it as final-layout proof.
- `after/after-about-closed-390x844.jpg` and `after/after-about-design-open-390x844.jpg`: native-scale native-details states.
- `after/after-forever-gate-top-390x844.jpg`: native-scale STOP report top, not a substantive figure.
- `home-word-bbox-audit.json`: four-width box/blank-band audit with its mixed live/static derivation boundary embedded.
- `final-verification.json`: final build ID, full verify result, prerender composition, static HTML/spot-check checks, initial-script scan, audit hashes, and explicit browser-evidence gaps.

## Evidence unavailable

- final Mobile Home 390/430 full pages and both final panel crops;
- final Mobile About Research method open capture;
- final Forever 390/430 full pages;
- production-browser JS-off, console, runtime canvas, and WebGL-initialization instrumentation;
- native-scale substantive Forever figure crops, because the data gate authorizes zero production figures.

## Removed mappings

The public Mobile Forever path no longer renders the earlier 1930–2024 empty field, 0–4 endpoint cards, stem/notch modern rake, shared unigram/bigram scale, independently scaled sparklines, conflict rail, or prose-derived visual metaphors. It renders a typed STOP report generated from the raw-data audit artifact. Research values in the legacy JSX/derived arrays remain inventoried as non-authoritative and unreachable from the mobile route; Desktop Forever remains isolated.

Mobile Home no longer carries the former method/design footer. Its content is now limited to project identification and the requested word field; method, design, provenance, rights, and accessibility material moved into the two native Mobile About disclosure groups.

## Open blockers

- The repository has no `/words/null` route or null study record. The requested `null/` is therefore visibly marked `No route` and is not fabricated as a link. The registry still has the published `/words/hub`; Mobile Home consequently has five truthful published links rather than the requested six.
- Final production-browser visual and console evidence is incomplete because of the tool boundary above.
- The build’s local 31-entry prerender count includes the user-owned, untracked Privacy demo and is not reproducible from a clean tracked checkout without that work.

These blockers keep `HOME_STRUCTURE_ACCEPTED=false` and `READY_FOR_USER_VISUAL_ACCEPTANCE=false`.

The final approved-environment `npm run verify` exited 0 with build ID `Bf-uEuLWPPjL-dPqKBD-1`; the preceding sandbox attempt failed only because Turbopack was prohibited from binding an internal worker port. The final build generated 31/31 actual working-tree entries, with the route-composition caveat above.

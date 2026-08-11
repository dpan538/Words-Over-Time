# Mobile Forever reference rebuild evidence

This directory binds the rebuilt mobile-only Forever study to the fixed Google Books English 2019 artifact, the four supplied visual references, and production-browser measurements.

## Reference comparisons

- `contact-sheets/F01-reference-3-vs-implementation.jpg` — pale full-bleed historical sheets, direct stacked values, hatching, and stepped peak/low/return blocks.
- `contact-sheets/F02-reference-1-vs-implementation.jpg` — black report field, neutral/yellow/green/violet panels, capsule labels, annual sequence, and bottom state control.
- `contact-sheets/F03-reference-2-vs-implementation.jpg` — black 2:3 interlocking five-tile mosaic, joined/spaced tonal hierarchy, large lower-aligned values, and asymmetric junctions.
- `contact-sheets/F04-reference-4-vs-implementation.jpg` — nested pale control/chart panels, three-state capsule, intensity rule, ten-stem rhythm, endpoint guide, and compact direct readings.

Only device shells, status hardware, third-party branding, avatars, watermarks, and reference-product copy were omitted. Words Over Time data and palette replace the source content without replacing the reference geometry.

## Browser evidence

- `screenshots/forever-mobile-390-full.jpg` and `forever-mobile-430-full.jpg` are exact viewport-tile stitches, not compressed single-frame previews.
- F01–F04 native 390 px crops retain their actual rendered heights.
- F03 includes front and flipped-band states; F04 includes RATE, REACH, and REPEAT states.
- 240 and 320 px reflow captures show the complete document with no document-level or figure-level horizontal overflow.
- `screenshots/forever-desktop-1440x900.jpg` records the unchanged existing Desktop Forever renderer.
- `browser-evidence.json` contains dimensions, surface allocation, interaction states, SSR checks, console results, build identity, and file checksums.

The comparison crops demonstrate implementation fidelity; final visual acceptance remains the user's decision.

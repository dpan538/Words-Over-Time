# SUPERSEDED — Words Over Time Mobile Research Editorial Edition

> **Superseded for all current mobile governance and future implementation.** This file is retained as historical design evidence only. Its desktop-as-canon, figure-count ceiling, no-card, static-only interaction, and visual-language constraints are non-operative wherever they conflict with [`docs/design/mobile/words-over-time-mobile-design-governance.md`](mobile/words-over-time-mobile-design-governance.md). The canonical governance defines mobile as an independently art-directed, data-led research edition; requires mobile-only swipeable/expandable cards and user-approved predesign; permits mobile-only analysis and figures; and keeps desktop read-only rather than authoritative over mobile.

**Authority:** Desktop `/about` is the binding design canon. This edition changes composition, density, and enhancement strategy below `60rem`; it does not create a second visual language or alter the desktop poster programme.

## Programme invariants

- Müller-Brockmann: a six-column alignment system remains underneath the mobile page. Modules may span 2, 3, or 6 columns; missing evidence stays visible rather than being filled for symmetry.
- Gerstner: colour remains a rule. `ink`, `wheat`, `blaze`, `fire`, `sun`, `nice`, `wine`, `sail`, and existing route extensions keep their current semantic jobs.
- Ruder: Helvetica Neue remains the neutral carrier. Monospace is reserved for figure numbers, periods, sources, status, and technical registers.
- HfG Ulm: every figure must distinguish source evidence, transformation, interpretation, absence, and claim limit.
- Swiss programme: asymmetric composition, flat form, systematic numbering, selective rules, and source-led captions continue without card, dashboard, or app chrome.

The project does not reproduce Swiss design as a historical style. It applies the principle that design structure makes claims, and those claims should be auditable.

## Mobile reading programme

1. The global header contains only `WORDS OVER TIME` and `ABOUT`.
2. Home is a typographic field of seven words; the project description and authorship sit at the end.
3. A word page opens with route label, word, scope, quiet evidence register, one research lead, and the first figure.
4. A page normally uses two, and never more than three, principal figures. Each figure answers one research question.
5. Allowed figure grammars are a static time trace, comparable ordered evidence strips, and a period × meaning matrix.
6. Source, coverage, interpretation, absence, and caveat remain visible at rest. Frequency is never presented as first attestation, and unlike corpora are never placed on one comparative scale.
7. Core mobile reading requires no hover, tap, drag, WebGL, selected state, or JavaScript. Native links and `<details>` are the only required interaction grammar; citation sharing is progressive enhancement.
8. Desktop posters and their interactions remain authoritative and unchanged at `60rem` and above. Mobile never imports or initializes Three.js.

## Visual-weight rules

- Mobile paper: `--wot-paper-mobile: #FCFAF3`, a higher-lightness member of the wheat family.
- Horizontal page padding: 18–22px. Major movements: 48–72px.
- The word is the only consistently extreme-heavy element. Figure titles use 24–32px/700; body and interpretation use 16–18px/400–500; source registers use 11–13px/400–600.
- Whitespace establishes the grid before rules do. A movement may use one major rule; internal rules are 1px.
- No gradients, shadows, glass, rounded cards, persistent accent rails, graph-paper fields, or colour-wash panels on mobile.

## Evidence dimensions

The names and meanings remain fixed: `01 Signal`, `02 Attestation`, `03 Variant`, `04 Context`, `05 Boundary`, `06 Rights`. A figure displays only dimensions it actually uses. An unavailable dimension is left blank or explicitly marked unavailable; it is never converted to zero.

## Reference implementation scope

This release establishes the accepted pattern on Home, Forever, and About. Remaining word studies are intentionally deferred to separate route-bounded translations after visual acceptance. Older mobile IA and visual-translation documents remain as historical audit evidence, but their component-stack and interaction requirements are superseded by this programme.

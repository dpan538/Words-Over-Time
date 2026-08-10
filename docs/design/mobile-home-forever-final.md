# Mobile Home + Forever — final scoped direction

## Home

Below 960px, Home is a three-movement typographic score rather than an index UI. Seven words occupy an invisible six-column grid across roughly 2.5 viewports. Scale, offset, a single vertical turn, route colour, blank space, and the recurring slash provide rhythm; none of these marks claims to encode research data. Published words remain ordinary links, `intelligence` remains visibly marked `(coming soon)`, and the project credit follows the complete word field. The desktop composition is unchanged.

## Forever

The mobile route is a static visual essay with three main research movements:

1. **Form current.** Year maps to horizontal position and frequency per million maps to vertical position on one shared square-root scale. The spaced form is a dashed blue trace and the joined form a solid orange trace. The compound sparklines use explicitly separate shape scales. These traces show source-specific print visibility, not attestation or meaning.
2. **Orthographic proof.** Approximate source order maps to vertical reading order. Written spaces and joined letters remain literal forms; colour distinguishes evidence roles, while type size is editorial. The open rail joins two conflicting `forevermore` date reports and is explicitly not a date range or confidence scale.
3. **Recurrence + record.** The archive plot places each phrase total on one shared 0–4 rule; the endpoint position is the counted appearance total, while the number of selected books is printed separately. A blank 1930–2024 movement exposes the absence of a comparable context layer; its height is editorial. In the modern source rake, one stem maps to one unique source page and one cross-line maps to one captured phrase appearance. Gutenberg and Wikinews remain separate evidence fields and cannot be read as one rank or growth series.

Rejected mobile encodings were removed: overlapping repeated heavy phrases, unlabeled square counts, hand-positioned SVG letterforms, excessive negative tracking, and source lines crossing text.

## Type and interaction boundaries

Mobile uses Helvetica Neue/Helvetica/Arial plus the existing monospace metadata face. The recurring roles are display word, 32px figure heading, 17px body, and 13px source/annotation; weights are principally 400, 600, and 800. Visible mobile text is never intentionally smaller than 13px and no 900 weight is used.

Primary research is server-rendered and complete without hover, selection, sliders, inspectors, motion, WebGL, or mobile Three.js. Colour is paired with line style, text labels, or printed units. Native links, one page-level citation/share enhancement, and an extended-source `<details>` are the only mobile interactions.

## Non-negotiable semantic core

- A data-led page must contain multiple legible evidence graphics. Oversized type can establish rhythm, but it does not count as data visualisation unless a real field is mapped to its position, size, repetition, distance, shape, or colour.
- The public mobile interface does not use the internal word `match` as a unit. It says **counted phrase appearance** for an archival count and **captured phrase appearance** for one occurrence in a captured result excerpt; the definition appears before the marks.
- Every quantitative mark states its unit before the visual begins. Unlabelled squares, unexplained repetition, and decorative marks that resemble counts are prohibited.
- Mobile citation, rights, sharing, and related-study controls remain available but default to a closed native disclosure headed by a 15px label. They must not dominate the visual essay’s final movement.

## Scoped evidence

- Home: `mobile-reart-home-390x844.png`, `mobile-reart-home-390-full.png`, `mobile-reart-home-430x932.png`, `mobile-reart-home-1440x900.png`
- Forever: `mobile-reart-forever-390x844.png`, `mobile-reart-forever-390-full.png`, `mobile-reart-forever-430x932.png`, `mobile-reart-forever-1440x900.png`
- Location: `docs/audit/screenshots/after/`

## Final production verification

- `npm run verify`: PASS — typecheck, research-data validation (46 terms, 27 sources, 29 evidence items, 37 relations, zero warnings), Next production build, and 31/31 static routes.
- Home at 390px: 390px client/scroll width, 2,108px document height, one H1, six published word links, and 13px minimum visible type. At 430px: 430px client/scroll width and one H1.
- Forever at 390px: 390px client/scroll width, 10,907px document height, one H1, 13px minimum visible type, zero canvases, no public `match` unit, and Citation closed by default under `Citation / rights / links`. At 430px: 430px client/scroll width, 10,669px document height, and the same accessibility boundaries.
- The 240px reflow proxy used for 200% zoom has no body overflow. Mobile primary figures and their source boundaries are present in raw server HTML, so the reading does not require client JavaScript.
- Browser console warnings/errors: none. Mobile Three.js initialization: none. The 1440×900 Home and Forever captures retain the desktop compositions; desktop Citation content remains displayed as a grid.

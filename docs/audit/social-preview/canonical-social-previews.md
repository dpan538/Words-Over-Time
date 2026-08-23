# Canonical social previews

Status: user visually accepted, 2026-08-23.

Release description: **Mobile SMO update — research-led canonical social previews.** This release improves the assets seen when a Words Over Time URL is shared from a mobile device or into a social/messaging surface. The resulting Open Graph and Twitter identity is canonical and edition-neutral: the same URL has the same preview regardless of whether the visitor later opens the mobile or desktop edition.

This document is the maintenance contract for the externally visible social-image assets. It does not authorize changes to either page edition.

## Contract

Words Over Time has one social identity per canonical URL. There is no mobile or desktop Open Graph variant. The server-only publication contract remains the semantic authority for Open Graph metadata and Twitter metadata. A server-only social-preview projection adds a short image subject, a concise editorial line derived from the same shared claim, a route-kind label, and a social-only accent.

The social renderer does not import the client-reachable `src/lib/site.ts`, visible components, or research data. It does not render search-intent terms or legacy keyword chips. Each canonical route has one dedicated Open Graph URL and one dedicated Twitter URL; Twitter pixels intentionally delegate to the corresponding Open Graph renderer.

## Writing standard

Social cards are research-showcase surfaces, not branding panels and not miniature SEO inventories.

- The supporting line must tell a curious reader what the project or study investigates, argues, compares, or makes visible.
- Home states the project identity. About states the method and rights scope. Words describes the larger, growing research publication; the number of currently published studies is inventory, not the ceiling of the project.
- A word-study card should foreground a research proposition or meaningful tension. Do not replace it with a list of themes, generic brand language, a sequence of search terms, or a marketing slogan.
- Every public claim on a canonical word card must be supported by the visible mobile and desktop editions. When the editions use different data releases, dates, analyses, or findings, use their defensible intersection and state the evidence scope.
- Do not imply a first use, linear semantic transition, causal result, universal definition, population frequency, or dataset availability unless the canonical evidence proves it.
- Keep methodological boundaries when they change the meaning of the claim. For example, the Forever card says `these printed-book frequency records` and does not publish a crossover year because the retained desktop and mobile records differ.
- Visible card copy must not contain implementation language such as `canonical route`, `machine contract`, `edition-neutral`, `client`, `desktop`, `mobile`, `SEO`, raw/cache paths, or component names.
- Use sentence case for prose and curly quotation marks for cited word forms. Image subjects remain lower-case to match the accepted title system.
- Character counts are only a drafting aid. The final gate is the generated 1200 × 630 PNG at full size and thumbnail size: no clipping, readable hierarchy, sufficient contrast, and an intentional line break approved by a human reviewer.
- The route matrix below is the accepted wording. Do not silently rewrite it while performing unrelated metadata, crawler, or frontend work.

## Route matrix

| Route | Machine / OG / Twitter title | Image title | Social-image supporting text |
| --- | --- | --- | --- |
| `/` | Words Over Time: Semantic Change and Word Frequency | words over time | Meaning shifts. Frequencies move. Visual evidence makes the change legible. |
| `/about` | Methodology, Sources, and Rights \| Words Over Time | methodology | The method behind the words: sources, limits, transformations, citation, and rights. |
| `/words` | Word Studies: Meaning and Usage Over Time \| Words Over Time | word studies | A growing research publication on how word meanings split, accumulate, and change—and what the evidence can actually support. |
| `/words/forever` | Forever and For Ever in Printed-Book Usage \| Words Over Time | forever / for ever | In these printed-book frequency records, “forever” overtakes “for ever”—a shift between written forms, not a stable definition. |
| `/words/artificial` | Artificial Meaning Over Time \| Words Over Time | artificial | Artificial has an earlier history in art and making, with distinct branches in simulation, distrust, bodily support, and modeled human processes. |
| `/words/hub` | Hub Meaning Over Time: Wheel to Network \| Words Over Time | hub | Hub travels from wheel centers into routes and networks while retaining the idea of a center and changing what gathers around it. |
| `/words/privacy` | Privacy: Public Attention and Institutional Systems \| Words Over Time | privacy | Privacy extends beyond private life: institutions translate it into policies, controls, rights, and risks. |
| `/words/data` | Data Meaning Over Time: From Given to Governed \| Words Over Time | data | Data is not simply given: collection, division, packaging, governance, and work shape what becomes usable. |
| `/words/depression` | Depression Meanings Across Weather, Economy, and Clinical Use \| Words Over Time | depression | Depression is one spelling across loweredness, melancholy, weather, economic crisis, and clinical diagnosis—not one settled meaning. |

## Accepted visual system

- Canvas: 1200 × 630 PNG.
- Ground and frame: wheat paper `#f7f0dc`, ink `#050510`, 18 px outer border.
- Title: one shared lower-case Helvetica Neue/Helvetica/Arial stack, 108 px, weight 900, line-height 0.9, tightened tracking, and the same subtle ink stroke on every route.
- Memory device: the route-colour terminal slash, underline, and top-right swatch. These marks are structural identity, not data encodings.
- Eyebrow: `WORDS OVER TIME / <route kind>` in the route accent. Words uses `RESEARCH PUBLICATION`, not a fixed study count.
- Supporting copy: 35 px, weight 700, written as research content rather than keyword decoration.
- Footer: author identity on the left and the canonical display domain on the right.
- Keyword chips, search-intent labels, chart numbers, device language, edition labels, raw paths, and UI section names are prohibited.

Current social-only accents:

| Route | Accent |
| --- | --- |
| `/` | `#006fb6` |
| `/about` | `#d93621` |
| `/words` | `#050510` |
| `/words/forever` | `#f06b04` |
| `/words/artificial` | `#d93621` |
| `/words/hub` | `#0b7f86` |
| `/words/privacy` | `#6f3aa6` |
| `/words/data` | `#1570ac` |
| `/words/depression` | `#006fb6` |

## Endpoint matrix

For each route above, the Open Graph endpoint is `<canonical-path>/opengraph-image` and the Twitter endpoint is `<canonical-path>/twitter-image`, with Home using `/opengraph-image` and `/twitter-image`. All 18 responses must be PNG, 1200 × 630, HTTP 200, and served from the canonical HTTPS `www` host in page metadata.

## Presentation boundary

The implementation changes only metadata image URLs and server-generated social pixels. It does not change page JSX, body DOM, visible page text, accessibility tree, links, layout geometry, CSS, mobile or desktop components, edition bridges, research data, or client presentation code. No native mobile sharing UI existed, so none was added. The runtime-dead `CitationAndSharing` and `FigureShareActions` components remain isolated and unchanged.

The Mobile SMO label does not authorize a mobile frontend change. A future native share button or `navigator.share()` handler requires a separate mobile design task, must comply with mobile governance, and must not revive `CitationAndSharing`, `FigureShareActions`, `WordPageShell`, or another shared desktop-era surface.

## Server-only architecture

```text
canonical publication contract
  -> server-only social-preview projection
      -> canonical OG/Twitter metadata URLs
      -> route-specific ImageResponse renderer
          -> Open Graph PNG
          -> byte-identical Twitter PNG
```

- `src/lib/machine/canonical-publication.ts` owns canonical metadata identity and image URLs.
- `src/lib/machine/social-preview.ts` owns the audited social-only editorial line, route-kind label, image subject, and accent.
- `src/lib/og-image.tsx` owns the shared Satori/ImageResponse composition.
- Root, About, Words, and canonical word-study metadata-image files are thin server wrappers.
- `src/lib/site.ts` remains a presentation registry and must not become the social semantic authority again.
- The canonical contract, social projection, and renderer must remain unreachable from `use client` dependency closures and client chunks.
- Unknown word-study image slugs must return 404; they must never fall back to Home artwork.

## Maintenance workflow

When copy changes or a canonical study is added:

1. Establish the public claim in the canonical publication contract and identify visible support in both editions.
2. Write the social line as a research proposition for a curious reader. Preserve source boundaries and remove unsupported causality, chronology, or universality.
3. Add or update only the server-side social projection and route-specific social accent. Do not edit page components or `site.ts` to feed a card.
4. Update the route matrix in this document and the exact expected projection in `scripts/audit_social_previews.ts`.
5. If the canonical route set grows, update the expected route/image counts and ensure the dynamic word image route generates and accepts exactly the canonical slugs.
6. Run a production build, start the production server, and run the source/build/runtime audit with `SOCIAL_PREVIEW_BASE_URL` set.
7. Review every generated PNG at 1200 × 630 and at a representative messaging thumbnail size. OG and Twitter pixels for a route must match.
8. Re-run the presentation freeze: mobile, desktop, edition, CSS, body DOM, visible text, accessibility tree, link graph, and client presentation assets must remain unchanged.
9. Obtain explicit user visual acceptance before staging or publishing a revised social-card set.

Do not update social copy merely to refresh dates, add keywords, follow a trend, or mirror one edition's newest finding. Machine-only or social-only maintenance does not automatically change content publication dates.

## Audit

`npm run audit:social:previews` checks source/build contract invariants and server/client isolation. With `SOCIAL_PREVIEW_BASE_URL` set to the production localhost, it also verifies normal-browser and six social-crawler user agents receive the same canonical metadata and body, checks every OG/Twitter image response, parses PNG dimensions, and confirms an unknown word-image slug does not fall back to Home.

Required validation commands:

```bash
npm run governance:mobile:verify
npm run audit:home:source
npm run audit:mobile:decoupling
npm run audit:forever:mobile:source
npm run audit:machine:readability
npm run typecheck
npm run build
SOCIAL_PREVIEW_BASE_URL=http://127.0.0.1:<port> npm run audit:social:previews
git diff --check
```

The social audit must verify exact canonical/OG/Twitter metadata for every route and crawler UA, 1200 × 630 PNG responses, unique route images, byte-identical OG/Twitter pairs, invalid-slug 404 behavior, fresh build artifacts, and zero client reachability. Passing automated checks does not substitute for user visual acceptance.

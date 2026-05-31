# Legibility Standards

Use this reference whenever designing, implementing, or critiquing typography for infographics, editorial data stories, research posters, dashboards, and visual essays.

Legibility is a structural requirement. If the reader cannot comfortably read labels, notes, and source boundaries, the visual system has failed no matter how strong the composition looks.

## Default Digital Minimums

Use these minimums for web and app interfaces:

- Body text: 16px minimum, 18px preferred for long editorial reading.
- Dense explanatory notes: 14px minimum; avoid long paragraphs below 15px.
- Metadata, captions, source labels, and table cells: 13px minimum.
- Chart labels and legends: 12px absolute minimum, 13-14px preferred.
- Axis ticks: 11px absolute minimum only when sparse; prefer 12-13px.
- Microcopy, badges, and compact uppercase labels: 11px absolute minimum; use only for short labels.
- Touch targets around interactive text or marks: 32px minimum, 40-44px preferred.

Do not use text below 11px in a digital interface except for nonessential decorative texture. If it carries evidence, source, caveat, or navigation, it must be readable.

## Editorial Scale

Recommended scale for research-led web pages:

- Page title or subject: 48-160px depending on viewport and purpose.
- Major section title: 24-40px.
- Chart/module title: 20-32px.
- Subhead or strong claim line: 18-24px.
- Body paragraph: 16-19px.
- Caption or method note: 14-16px.
- Table and source ledger text: 13-15px.
- Chart annotation: 12-14px.

Large type is useful only when it clarifies hierarchy. Do not compensate for unreadable small text by making the hero enormous.

## Line Height And Measure

- Body text: line-height 1.45-1.65.
- Compact notes and captions: line-height 1.35-1.55.
- Uppercase metadata: line-height 1.25-1.45.
- Large headlines: line-height 0.9-1.1, only when words do not collide.
- Long-form measure: 55-85 characters per line.
- Dense notes: 45-75 characters per line.
- Tables: allow wrapping or horizontal scroll rather than shrinking below minimums.

## Letter Spacing And Case

- Do not use negative letter spacing.
- Keep normal-case body text at default letter spacing.
- Use uppercase only for short metadata labels, not paragraphs.
- For uppercase labels, use modest positive tracking and check that words still fit on mobile.
- Monospace is useful for metadata and numeric labels, but it often needs slightly larger sizing than proportional sans text.

## Contrast And Weight

- Small text needs stronger contrast than large display type.
- Avoid low-opacity labels below 14px unless they are nonessential.
- For source labels, caveats, and methods, prefer full-size text with moderate contrast over tiny high-contrast text.
- Thin font weights are risky for chart labels and metadata. Prefer medium, bold, or black weights only when they fit the design system.

## Mobile Rules

At mobile widths:

- Body text remains at least 16px.
- Captions and notes remain at least 14px.
- Chart labels remain at least 12px or are replaced by interaction/inspection.
- Metadata tables stack label/value rows instead of shrinking.
- Long labels wrap, abbreviate, or move into an inspector.
- If a dense visualization must preserve structure, use horizontal scroll rather than unreadable compression.

## Static Poster, Print, And Slide Rules

For posters or slides, minimum size depends on viewing distance:

- Printed A3/A2 close reading: body 9-11pt minimum; captions 7.5-9pt minimum.
- Wall poster viewed at distance: body 14-18pt minimum; captions 10-12pt minimum.
- Presentation slides: body 20-28pt; captions 16-20pt; chart labels 14-18pt.

When uncertain, test by exporting at final size and viewing at the expected distance. If the viewer must lean in for labels that carry evidence, increase size or reduce density.

## Dense Chart Strategy

When labels do not fit:

1. Reduce the number of visible labels.
2. Group labels into bands or legends.
3. Move details into hover/focus/tap inspectors.
4. Use abbreviation with an explicit key.
5. Increase chart size or allow scroll.
6. Split the chart into small multiples.

Do not solve label crowding by shrinking evidence text below the minimum readable size.

## Verification Checklist

Before shipping:

- Check desktop, tablet, and mobile widths.
- Zoom browser to 125% and confirm no key labels break.
- Confirm every source label, caveat, and method note is readable.
- Confirm chart labels do not overlap marks or each other.
- Confirm long words and uppercase strings wrap without overflow.
- Confirm screenshots or exports remain readable at intended publication size.

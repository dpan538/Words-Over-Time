# Pattern Library

Use this reference when planning or implementing a source-led infographic, editorial data story, or research-led editorial page.

## Page Spine

Use this sequence for a complete research-led page:

1. Navigation or publication context.
2. Subject hero: title, one-sentence thesis, compact metadata.
3. Panel progress: ordered chart modules with numbers, labels, and color chips.
4. Entry note: plain-language explanation of why the subject matters.
5. Repeated poster sections: eyebrow, title, interpretive intro, visualization.
6. Bridge notes between major modules when the argument changes scale.
7. Synthesis: what the visual system shows without overstating it.
8. Source ledger, methods, claim boundaries, rights, and citation notes.

This spine can be shortened, but do not remove claim boundaries when the data is transformed, curated, or source-limited.

## Hero Pattern

Purpose: establish the subject before any explanation.

Ingredients:

- Paper ground with visible rules or subtle grid.
- Huge subject name or literal object title.
- Short thesis line in strong sans.
- Monospace keyword line for semantic field or evidence scope.
- Metadata table with scope, period, sequence, method, source family, or status.

Avoid generic hero art. The first viewport should identify the research object, not sell the page.

## Six-Column Evidence Ruler

Use when the whole page needs an auditable structure.

Columns:

- Signal
- Attestation
- Variant
- Context
- Boundary
- Rights

Behavior:

- Keep the ruler sticky only if it helps orientation.
- Use faded text or dashed rules for absent, pending, or restricted evidence.
- Let click or hover expand concise descriptions, but keep the resting state readable.

## Poster Section

Use for each major chart or argument block.

Structure:

- Left column: monospace eyebrow such as `02 / geographic attention`.
- Right column: strong title, short intro, then visualization.
- After the visualization, add a note band if interpretation needs guardrails.

The intro should frame the chart's reading method, not repeat the title.

## Panel Progress

Use when a page contains several visual modules.

Rules:

- Number each module in reading order.
- Use small color chips to bind progress to visual families.
- Use dashed connector lines when the panels are sequential but not strictly causal.
- Keep labels short enough for mobile. Hide secondary labels on small screens if needed.

## Evidence Cards

Use for source-to-output explanation.

Each card should contain:

- Source type.
- Output type.
- Short body explanation.
- Constraint or caveat.
- Color accent tied to source family.

Hover or focus may increase contrast, but the source type and output should be visible at rest.

## Source Ledger

Use a table when several upstream sources have different roles and rights.

Columns:

- Source.
- Role or use.
- Coverage.
- License or rights note.

Use colored role labels only when the same role color appears in charts. Do not use role chips as decoration.

## Method and Transform Notes

Use a compact rule-separated list for:

- Source capture.
- Frequency normalization.
- Display transformation.
- Phrase and variant policy.
- Semantic grouping.
- Branch or dependency scoring.
- Confidence and boundary labels.

Always distinguish raw values from visual indexes, max-normalized values, ranks, square-root scales, and curated categories.

## Inspector Pattern

Use for interactive marks when readers need proof.

An inspector entry should expose:

- Title and visual type.
- Period and source corpus.
- Data layer: raw, computed, curated, interpretive.
- Selection reason.
- Raw inputs.
- Derived values.
- Curated decisions.
- Visual mapping.
- Explanation, sources, and caveats.

This pattern prevents interactive charts from becoming uninspectable spectacle.

## Responsive Rules

- Give charts stable dimensions with `aspect-ratio`, min/max widths, or fixed grid tracks.
- Let dense charts scroll horizontally only when preserving structure is more important than compression.
- Keep metadata tables readable on mobile by stacking label/value rows.
- Reduce labels before reducing evidence structure.
- Check that long words, uppercase labels, and numeric strings do not overflow.

## Visual QA Checklist

Before finishing:

- The subject is visible in the first viewport.
- Every major visual mark has a source family or transform rule.
- Curated interpretation is visually distinct from measured data.
- Empty or restricted evidence is visible.
- Caveats sit near the claim they qualify.
- Palette has more than one functional family.
- Text fits mobile and desktop containers.
- Tables can scroll or reflow without losing labels.
- Interactive states are keyboard and hover accessible.
- The design still makes sense with motion disabled.

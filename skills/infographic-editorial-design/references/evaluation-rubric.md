# Evaluation Rubric

Use this reference to critique or verify an infographic, editorial data story, research poster, or research-led editorial page.

## Severity Levels

- Critical: the design makes an unsupported claim, mislabels evidence, hides a major caveat, makes essential evidence text unreadable, or breaks the primary reading path.
- High: the design weakens source traceability, confuses data and interpretation, fails responsive reading, uses undersized labels for important evidence, or loses key hierarchy.
- Medium: the design is readable but has avoidable ambiguity, weak rhythm, overloaded labels, inconsistent color semantics, or insufficient method notes.
- Low: polish issues that do not materially affect meaning.

## Review Dimensions

### Claim Integrity

Check:

- Is the central claim stated clearly?
- Does the visual evidence support only that claim?
- Are causal, universal, legal, clinical, cultural, or moral implications avoided unless proven?
- Are transformed values labeled as transformed values?

Common fixes:

- Rewrite the thesis as a bounded claim.
- Move caveats closer to the chart.
- Separate source-supported statements from editorial interpretation.

### Evidence Mapping

Check:

- Can every mark be traced to a source, transform, or curated decision?
- Are raw data, computed data, and interpretation visually distinct?
- Are absences, pending checks, and restricted sources visible?
- Are source roles consistent across legend, color, and text?

Common fixes:

- Add an evidence ruler or source ledger.
- Add hover/focus inspector entries for dense marks.
- Replace decorative color with source-family color.

### Editorial Hierarchy

Check:

- Is the subject visible immediately?
- Does the reader know where to start, what to inspect, and where the argument resolves?
- Are metadata, method, caveat, and synthesis placed at the right weight?
- Are section titles informative rather than ornamental?

Common fixes:

- Strengthen the subject title and thesis.
- Add panel progress.
- Convert long explanatory blocks into section intros and note bands.

### Visual System

Check:

- Do grid, spacing, typography, and color behave as rules?
- Is the palette functional rather than mood-based?
- Does the layout avoid nested cards, decorative blobs, and generic dashboard chrome?
- Is motion used for relation, selection, or flow rather than spectacle?

Common fixes:

- Define a compact palette map.
- Replace cards with rule-separated sections where the content is editorial.
- Use borders, chips, tables, and lanes as information structure.

### Legibility

Check:

- Does body text meet the digital minimum of 16px, with 18px preferred for long reading?
- Are dense explanatory notes at least 14px?
- Are metadata, captions, source labels, and table cells at least 13px?
- Are chart labels and legends at least 12px, with 13-14px preferred?
- Are axis ticks at least 11px only when sparse, and preferably 12-13px?
- Are uppercase labels short, tracked modestly, and readable on mobile?
- Do source notes and caveats use enough size and contrast to be read without zooming?

Common fixes:

- Increase type size before reducing evidence content.
- Move dense labels into inspectors, legends, small multiples, or scrollable regions.
- Replace long visible labels with short labels plus an explicit key.
- Increase chart dimensions rather than shrinking essential text.

### Accessibility And Responsiveness

Check:

- Does text fit all containers?
- Are charts legible on mobile or intentionally scrollable?
- Are hover states also focus-accessible?
- Does contrast remain sufficient for small labels and metadata?
- Does the artifact still read without animation?
- Does browser zoom at 125% preserve source labels, caveats, and chart annotations?

Common fixes:

- Use stable dimensions and responsive grid tracks.
- Stack metadata rows on mobile.
- Reduce secondary labels before compressing evidence structure.
- Use `legibility-standards.md` to decide whether to resize, hide, group, or inspect dense labels.

## Publication Readiness

Before publication, confirm:

- Source URLs and rights notes are present.
- Third-party material is summarized or excerpted within allowed limits.
- Citation language distinguishes the artifact from upstream sources.
- The design does not copy a protected project identity unless permission exists.
- The final artifact has been checked at mobile and desktop sizes.
- The final artifact has passed legibility checks for body text, chart labels, metadata, captions, caveats, and source notes.

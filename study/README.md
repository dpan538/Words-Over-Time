# Words Over Time reader study package

This folder prepares optional reader-study materials for Words Over Time.

Current article direction has shifted away from a reader study and toward visual communication / information design artifact analysis. The active package for that direction is `words_over_time_visual_communication_package/`.

Working title:
Visualising Semantic Change with Source Boundaries: A Reader Study of the Words Over Time Interface

Optional reader-study research question:
How does the Words Over Time evidence-grid interface help readers distinguish frequency, attestation, context, interpretive uncertainty, claim boundaries, and rights/attribution when reading semantic change?

## Scope

- Study type: exploratory mixed-method reader study.
- Proposed sample: 12-18 adult participants, after a 3-person pilot.
- Proposed stimuli: `data`, `artificial`, and `forever`.
- Conditions: baseline/simplified frequency-first materials and evidence-grid materials.
- Data policy: commit templates, scripts, anonymized dummy data, and aggregate outputs only.

Do not begin formal participant recruitment or data collection until the required ethics approval, exemption, or waiver route has been confirmed.

## Folder map

- `protocol/` contains participant-facing and ethics-review draft materials.
- `materials/` contains stimuli notes, screenshot capture records, and manifests.
- `data_templates/` contains CSV templates and anonymized dummy rows for testing.
- `analysis/` contains reproducible analysis and figure-generation scripts.
- `outputs/` is the target location for aggregate tables, figures, and summaries.
- `manuscript_support/` contains article-support documents.

## Quick script check

From the repository root:

```bash
python3 study/analysis/analyse_reader_study.py
python3 study/analysis/generate_reader_study_figures.py
```

The default input is `study/data_templates/dummy_participant_responses.csv`.

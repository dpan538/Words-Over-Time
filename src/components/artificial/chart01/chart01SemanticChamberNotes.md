# Chart 01 Semantic Chamber Notes

## 1. What Was Implemented

- A static-first Three.js chamber for Chart 1.
- Native Three.js scene with a fixed front-facing perspective camera.
- One-point-perspective open chamber, five-face inward speaker-ring substrate, left/right/back semantic walls, a central focus word, node markers, and state-based semantic paths.
- HTML labels projected from manually authored 3D coordinates.
- Five simple button states: resting, word family, technical, sense boundary, and full overlay.
- Hover highlighting for labels, with the inspection panel moved into the right sidebar.
- Leitner-informed visual grammar pass: very light substrate, open-front chamber, technical arrows, inward speaker grids, fog depth, wall highlighting, and light parallax.
- Performance split: renderer, scene, camera, chamber substrate, resize observer, and RAF loop are initialized once; state changes only replace the semantic group; hover changes only affect HTML labels/sidebar.

## 2. What Was Intentionally Left Low-Fidelity

- Typography is not final.
- Spatial layout is hand-authored and approximate.
- Edge styles are intentionally thin; wall-to-center and center-to-wall paths now carry the main visual weight.
- There is no scroll choreography.
- There is no final annotation copy.
- There is no advanced responsive polish beyond a desktop-first chamber.

## 3. Which Nodes Were Excluded From The First Visible Chamber

- `artificial_lines` is excluded from visible chamber data and kept notes-only by design.
- Shell nodes from the structure specification are represented as Three.js chamber geometry rather than data labels.
- Additional source/evidence nodes are not included.
- Later-chart terms such as AI, synthetic materials, food additives, body replacement, and consumer examples are excluded.

## 4. Which Nodes Are Weak / Low Confidence

- `artificial_day` appears only as a small annotation.
- `artificial_memory` is visible in the technical state but carries medium confidence.
- `affected_insincere` is lower weight than the main sense-boundary path.
- `fake_not_genuine` is visible, but positioned as a suspicious branch rather than an origin sense.

## 5. How The Not-Natural Vs Fake Distinction Is Protected

- `not_natural -> fake_not_genuine` is typed as `semantic_drift`, not equivalence.
- A separate `contrast` edge exists for the same pair in sense-boundary state.
- The guide label `not natural is not fake` appears in the sense-boundary state.
- The chamber keeps `not_natural` visually between `contrivance_construction` and `fake_not_genuine`, but uses dotted/contrast styling and arrow labels so the relation reads as drift/branch, not equality.

## 6. Known Readability Issues

- HTML labels can still crowd one another in the full-overlay state.
- Small screens will need a more deliberate fallback or simplified 2D plate.
- The current model uses semantic walls rather than parallel front-facing planes: word family on the left wall, technical uses on the right wall, and sense boundary on the back wall.
- The camera is centered just outside the open chamber entrance and includes slight pointer parallax, but it may need damping if the labels feel too active.
- The five-face ring substrate is intentionally light and clipped near the front opening; it may need density or opacity adjustment after browser review.
- The guide labels may need to move outside the chamber frame in the next pass.
- Arrow labels may need manual offsets after visual review.

## 7. Recommended Next Iteration

- Review node density in the full-overlay state.
- Decide whether `artificial_day` should remain visible or move to hover/notes only.
- Test whether `artificial_memory` should be promoted to always-visible in technical state.
- Tune the thickness of the heavy paths against the archival substrate.
- Tune wall highlights and fog distance so the back wall stays readable without flattening the chamber.
- Improve line styles for contrast vs semantic drift after screenshot review.
- Consider a flat SVG/isometric fallback for mobile before polishing the Three.js layer.

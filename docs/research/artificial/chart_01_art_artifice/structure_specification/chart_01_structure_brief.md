# Chart 01 Structure Brief

## 1. Purpose

Chart 1 is a semantic apparatus for the first layer of `artificial`. It translates the research conclusion into a spatial reading structure: before the modern shortcut `artificial = fake`, the word belongs to a field of art, skill, craft, making, contrivance, technical rule, and learned construction.

This brief defines the apparatus shell, semantic planes, nodes, edges, and interaction states for a later low-fidelity prototype. It is not a visual design, page copy, or implementation plan.

## 2. Why This Is An Apparatus, Not A Normal Chart

This chart should not behave like a timeline, 3D word cloud, scatterplot, or generic network. It should behave like a lexical chamber: a bounded space that lets the reader enter a layered semantic structure.

The apparatus uses spatial organization to clarify distinctions that are easy to collapse in prose:

- `made by art / skill` is not `fake`.
- `contrivance / construction` is a bridge sense, not deception only.
- `not natural` is distinct from `fake / not genuine`.
- `affected / insincere` is a weaker affective branch, not the whole meaning of the word.

## 3. Core Semantic Correction

The working correction is:

```text
artificial does not simply mean fake.
```

The core path is:

```text
art / skill / making
-> contrivance / construction
-> not natural
-> fake / affected
```

The final apparatus must make this path readable without implying equivalence between `not natural` and `fake`.

## 4. Chamber Structure

The structure is named:

```text
semantic_chamber
```

It contains:

- `outer_wireframe`: a quiet spatial boundary, not decoration.
- `front_plane_word_family`: the word-family plane.
- `middle_plane_technical_construction`: the technical construction plane.
- `back_plane_sense_boundary`: the sense-boundary plane.
- axis labels for `skill / making`, `contrivance`, `not natural`, and `fake / affected`.
- projection lines between planes.
- guide labels that appear only when useful.

The chamber should stay readable in a static screenshot. Later interaction can clarify the structure, but it must not be required for basic comprehension.

## 5. Three-Plane Model

### Plane 1: Word Family

Purpose: show that `artificial` contains older art / skill / maker relations.

Core nodes:

- `art`
- `artifice`
- `artificer`
- `artificial`
- `artificially`

This plane answers: where does the word come from semantically?

### Plane 2: Technical Construction

Purpose: show that early `artificial` can describe rule-based, learned, rhetorical, mathematical, and technical construction.

Stronger nodes:

- `artificial_arguments`
- `artificial_numbers`
- `artificial_memory`

Weak / lower-visibility nodes:

- `artificial_day`
- `artificial_lines`

This plane answers: how was artificial used as rule-based or learned construction?

### Plane 3: Sense Boundary

Purpose: separate senses that modern readers often collapse.

Core nodes:

- `made_by_art_skill`
- `contrivance_construction`
- `not_natural`
- `imitation_substitute`
- `fake_not_genuine`
- `affected_insincere`

This plane answers: where does the modern misunderstanding begin?

## 6. Node Groups

Node groups are intentionally edited, not auto-generated from CSV.

- Word-family nodes explain the internal lexical family.
- Technical-construction nodes provide early rule-based evidence.
- Sense-boundary nodes clarify the semantic split.
- Shell nodes define the chamber and planes.
- Guide nodes warn against common misreadings.

Each node must carry `confidence`, `visibility`, and `weight` so the future visualization can preserve evidence hierarchy.

## 7. Edge Groups

Edges are semantic notation, not decoration.

- `word_family` edges show lexical relation.
- `semantic_projection` edges connect a word-family node to a sense node.
- `technical_support` edges connect a sense to early technical anchors.
- `sense_branch` edges show branch structure.
- `contrast` and `semantic_drift` edges prevent false equivalence.
- `shell` and `guide` edges support reading structure.

The `not_natural -> fake_not_genuine` connection must be treated as contrast or semantic drift, never equality.

## 8. Interaction Logic

The apparatus should support five reading states:

1. `state_resting_view`: chamber, faint planes, central `artificial`.
2. `state_word_family_active`: reveal the internal word family.
3. `state_technical_active`: reveal rule-based construction anchors.
4. `state_sense_boundary_active`: separate collapsed modern meanings.
5. `state_full_overlay`: show all layers together with weak anchors faint.

Interaction can be scroll-based, hover-based, click-based, or a combination, but the structure must not depend on free 3D navigation.

## 9. Static Screenshot Requirement

The default view must work as a still image. A reader should understand that this is a spatial semantic chamber with three layers, even without interacting.

Static readability requires:

- fixed or constrained camera;
- no fully overlapping labels;
- strongest path visible;
- weak anchors low-opacity or hidden;
- shell lines lighter than semantic paths;
- guide labels used sparingly.

## 10. What Must Not Be Implied

The apparatus must not imply:

- `artificial` originally meant fake.
- `made by art / skill` is morally bad.
- `contrivance` means deception only.
- `not natural` equals fake.
- `affected / insincere` is equally central to Chart 1 as `made by art / skill`.
- weak anchors such as `artificial_day` and `artificial_lines` have the same evidence strength as `artificial_arguments` or `artificial_numbers`.

## 11. What Remains Open

- Whether `artificial_day` should be visible or notes-only.
- Whether `artificial_memory` should be always visible or hover-qualified.
- Whether `artificer` should appear as a core visible node or supporting node.
- Whether the sense-boundary plane should appear at first load.
- Whether the chamber should use orthographic or mild perspective projection.
- How many edges can remain visible in the full overlay without clutter.
- Whether guide labels belong inside or outside the chamber frame.

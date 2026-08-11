# Repository instructions

This file governs the entire repository tree. The marked Words Over Time mobile governance block applies only to mobile public routes, mobile-only components and styles, mobile copy, mobile data analysis, mobile visualization, and mobile verification. It does not govern desktop art direction except to require that desktop remain read-only unless the user separately authorizes a desktop change.

<!-- BEGIN WORDS_OVER_TIME_MOBILE_DESIGN_GOVERNANCE -->

## Words Over Time mobile research edition — binding design governance

All mobile public-route, mobile component, mobile copy, mobile data-analysis, and mobile visualization work must comply with:

`docs/design/mobile/words-over-time-mobile-design-governance.md`

This governance is authoritative and non-negotiable unless the user explicitly changes it in a later instruction.

- Mobile is an independently art-directed research edition, not responsive desktop.
- Desktop may provide terminology, sources, and candidate findings, but not page structure, figure geometry, analytical depth, or an implementation ceiling.
- A visualization absent from desktop may still be mandatory on mobile.
- Analysis absent from desktop must still be proposed and performed for mobile when valid project data supports it.
- Mobile findings must be traced back to current data, scripts, types, provenance, denominators, and missingness. Desktop prose is not research authority.
- Published mobile word-study pages target approximately 60% primary data visualization, 30% swipeable/expandable data cards, and 10% always-visible prose by rendered vertical surface area.
- Mobile cards require touch-native horizontal swipe with an adjacent-card cue and accessible accordion expansion. Collapsed cards retain a useful statistic and microvisualization; expanded cards carry longer interpretation, method, caveat, and source detail.
- The supplied weather, health-card, annual-report, and coloured mobile-report references are reconstruction targets for geometry, density, hierarchy, proportions, and behavior. They are not loose mood-board references.
- No page implementation begins before a data-led figure/card contract, 390 px storyboard, reference mapping, and 60/30/10 audit receive explicit user approval.
- Desktop page/figure components, desktop CSS/layout, desktop narrative order, hover/inspector logic, and direct desktop visualization adaptations are prohibited in mobile implementations.
- Desktop remains read-only unless separately authorized.
- Never interpret a redesign request as minimal optimization, smallest diff, breakpoint cleanup, stacking, parity, or polish.
- Never claim visual or design acceptance on the user’s behalf.
- One lead agent owns mobile art-direction coherence. Additional agents may perform bounded audits or verification, but may not independently reinterpret the design system.

# Words Over Time — Mobile Research Edition Design Governance

**Status:** AUTHORITATIVE / NON-NEGOTIABLE  
**Applies to:** all mobile public routes, mobile-only components, mobile figure specifications, mobile copy editing, and mobile verification for Words Over Time  
**Does not authorize:** changes to the desktop editions  
**Supersedes:** any earlier assumption that mobile is a responsive, reduced, rearranged, simplified, or minimally optimized version of desktop

## 0. Binding interpretation

The mobile edition is an independently art-directed research publication. It is not a responsive derivative of desktop.

The desktop edition may be consulted for terminology, sources, previously verified findings, and research questions. It is **not** a template, component library, narrative outline, analytical ceiling, or inventory of the visualizations mobile is allowed to contain.

The following two statements are binding:

> A visualization missing from desktop may still be required on mobile.

> Analysis not implemented on desktop may still need to be performed and visualized for mobile when the available data supports it.

Desktop absence is never evidence that a mobile figure, statistic, comparison, or analysis is unnecessary. Conversely, desktop presence is never sufficient justification for copying a figure or paragraph to mobile.

If an implementation decision conflicts with this document, stop and resolve the conflict before writing page code. Do not reinterpret “redesign” as “smallest diff,” “responsive cleanup,” “mobile parity,” “stacking,” or “polish.”

## 1. Product definition

Words Over Time mobile is a **vertical, data-led research report** designed specifically for a handheld viewport.

Its primary job is to let a reader encounter evidence, statistics, variation, uncertainty, and sources through mobile-native visual composition. Text supports the data; text does not occupy the page as the principal visual material.

Each published word-study page must feel like an authored mobile report, not:

- a desktop poster squeezed into one column;
- a long article with occasional charts;
- a set of desktop sections placed inside rounded containers;
- a responsive version of existing SVG, Canvas, Three.js, or chart components;
- a visual placeholder assembled from oversized words, empty space, or decorative marks;
- an audit or implementation-status screen exposed as public editorial content.

## 2. Separation from desktop

### 2.1 Mobile may use

Mobile may use the following project knowledge only after verifying it against the current data and provenance:

- canonical raw and processed data;
- typed data contracts and field definitions;
- reproducible statistical outputs;
- source identity, provenance, rights, and citations;
- canonical word forms, terminology, definitions, and route identity;
- previously verified desktop findings as **candidate findings to re-check**;
- global brand primitives explicitly approved for both editions, such as core type families or word colours.

### 2.2 Mobile may not inherit

Mobile must not directly inherit or adapt:

- desktop page JSX or desktop section components;
- desktop figure components or desktop figure geometry;
- desktop CSS grids, breakpoints, spatial scenes, or interaction models;
- desktop content order or section hierarchy;
- desktop analytical paragraphs as the mobile narrative structure;
- desktop paragraph-to-chart pairings;
- desktop inspector, sidebar, hover, drag, 3D, or pointer-dependent meaning;
- desktop limitations in analytical depth, chart count, or data coverage;
- hard-coded decorative values that only resemble data.

Shared code must be restricted to neutral data loaders, types, validation, provenance, and genuinely presentation-agnostic tokens. A component originally designed to render a desktop figure is not presentation-agnostic.

### 2.3 Desktop is read-only

Mobile work must not alter desktop composition, copy, chart behavior, or desktop visual regression baselines unless the user separately authorizes a desktop change.

## 3. Data-first obligation

No word-study predesign may begin from the desktop layout. It must begin from the data.

Before proposing figures for a page, inspect:

1. raw inputs and retained captures;
2. processed/generated datasets;
3. data-building and fetching scripts;
4. data types and validation rules;
5. source, release, denominator, temporal, geographic, and rights metadata;
6. missingness, duplication, coverage, and comparability limits;
7. previously stated findings, treated as hypotheses rather than authority.

For each candidate finding, independently recalculate or trace the result. Never infer a statistic from display geometry or prose.

If existing data supports useful analysis that desktop never implemented, mobile work must propose and, after approval, create the required derived dataset and visualization.

If the project truly lacks the data required for a figure, record the missing input and block that figure. Do not fill the space with prose, decoration, fabricated numbers, or a public STOP report. Continue assessing other valid evidence directions for the page.

## 4. Required predesign gate

No page implementation starts before the user approves a page-level predesign.

Each predesign must contain:

- the page’s principal research question;
- the strongest supported finding and its exact result;
- every proposed figure in reading order;
- every supporting data card in swipe order;
- the exact fields, filters, groups, denominator, formula, and units used;
- the visual encoding for every field;
- missingness and comparability treatment;
- the collapsed and expanded content of every accordion card;
- the reference-image composition assigned to each module;
- a mobile storyboard showing page rhythm at 390 px;
- a surface-area estimate demonstrating the 60 / 30 / 10 rule;
- clear notes on which new analysis does not exist on desktop.

The user approves the research and composition before Codex receives an implementation prompt. Code is not a substitute for predesign review.

## 5. Page composition ratio

For every published **word-study page**, the approximate rendered vertical surface area is:

- **60% primary data visualizations** — full-width or near-full-width analytical figures, plots, matrices, evidence fields, and diagrams;
- **30% data cards** — swipeable metric cards and expandable evidence cards with compact charts;
- **10% always-visible prose and navigation** — headings, one-sentence findings, short labels, and transitions.

This is a surface-area rule, not a word-count aspiration and not merely a component-count ratio. It must be checked from rendered bounding boxes or an equivalent layout audit.

Long explanations, methods, caveats, definitions, source detail, and supporting passages belong inside expandable cards or the final folded source/copyright disclosure. They do not remain as uninterrupted body-copy sections.

The ratio does not force weak or invalid figures. If insufficient valid data prevents the ratio, stop the page at predesign and report the evidence gap privately rather than replacing data with visible prose.

### 5.1 Home exception

Mobile Home is a project-identification opening, not a word-study report. Its order is fixed:

1. site header;
2. `WORDS YOU WANNA KNOW:`;
3. the seven word labels arranged as a deliberate typographic composition;
4. `OVER TIME` as the closing phrase of the word field;
5. a concise project introduction;
6. copyright/rights, closed by default.

Home does not contain research method or design-research exposition.

### 5.2 About exception

Mobile About carries project explanation and methodology. `Design` and `Research method` are native, default-closed accordion disclosures. Desktop About remains independent.

## 6. Visual reference replication

The supplied reference images are not loose mood-board suggestions. Their geometry, density, hierarchy, proportions, spacing logic, and component behavior must be deliberately reconstructed for Words Over Time. Brand names and third-party logos are not copied; project data, copy, typography, and route colours replace them.

Before implementation, create a reference-decomposition sheet that records measurable properties: outer gutter, card width, adjacent-card peek, corner radius, padding, heading/number/unit ratios, chart allocation, rule thickness, label placement, and colour-area proportions.

### 6.1 Layered data field — weather reference

Use the weather-interface reference for analytical fields that contain several aligned layers or conditions.

Required characteristics:

- a pale full-surface field rather than a floating desktop panel;
- stepped translucent colour regions that correspond to real categories, bands, periods, or evidence layers;
- one dominant statistic or finding crossing the composition;
- compact left/right labels aligned to the marks they explain;
- small metadata and symbols only when each has defined meaning;
- dense information without converting the module into a paragraph.

Stepped shapes must encode data or a documented state. They may not be decorative atmospheric blocks.

### 6.2 Compact metric card — health reference

Use the health-card reference for compact, swipeable statistical summaries.

Required characteristics:

- title and scope/timeframe on the first row;
- a large value with a visibly subordinate unit;
- a microchart occupying the lower portion of the card;
- a clearly marked current, selected, or focal datum;
- direct labels and a compact active-index pill;
- consistent card geometry across a swipe set;
- only the data, title, unit, and microchart visible while collapsed.

Do not replace the microchart with explanatory prose.

### 6.3 Full-width report figure — annual report reference

Use the annual-report reference as the principal visual grammar for major word-study figures.

Required characteristics:

- strong black rules or bands separating report movements;
- an editorial eyebrow and a very large primary result;
- the unit aligned as an independent typographic element;
- a tall chart field that receives substantially more space than prose;
- direct value labels and deliberately rotated labels where density requires them;
- full-width reading rather than an inset desktop panel;
- route colour used structurally for series, areas, points, or emphasis.

The chart must remain statistically truthful. The visual replica does not authorize mismatched axes, distorted baselines, or unlabelled normalization.

### 6.4 Saturated report card — mobile report reference

Use the coloured mobile-report reference for card shell, stacking, expansion affordance, and compact report hierarchy.

Required characteristics:

- strong filled card surfaces separated by dark gutters or rules;
- a small capsule label at the top left;
- a circular or strongly bounded expand/advance control at the top right;
- one dominant number, comparison, or compact chart;
- a short evidence statement separated by a rule;
- consistent rounded geometry and tight vertical stacking;
- no generic dashboard chrome added beyond what the data requires.

## 7. Mobile component system

The mobile edition requires a mobile-only component system. Names are illustrative; implementation names may differ, but responsibilities may not be collapsed into desktop components.

### 7.1 `MobileReportFigure`

A full-width primary visualization. It owns its figure title, unit, direct labels, graphic, one-sentence finding, compact caveat, and source disclosure trigger.

### 7.2 `MobileSwipeRail`

A horizontally scrollable, touch-native, CSS scroll-snap rail.

Requirements:

- the next card remains visibly exposed;
- swipe works without drag libraries;
- keyboard and button access exist in addition to touch;
- the rail does not create page-level horizontal overflow;
- scroll position does not hide critical meaning;
- a reduced-motion setting does not remove content;
- cards are ordered analytically, not randomly.

Target starting geometry at 390 px, to be refined against the references:

- page gutter: 16–20 px;
- card width: approximately 84–88 vw;
- inter-card gap: 10–14 px;
- adjacent-card peek: at least 20 px;
- card radius: approximately 20–28 px;
- internal padding: approximately 18–22 px.

### 7.3 `MobileExpandableDataCard`

An accessible accordion card, preferably based on native `<details>/<summary>` unless a custom control is demonstrably necessary.

Collapsed state must show:

- card label/title;
- principal number or finding;
- unit and scope;
- a meaningful microvisualization;
- expansion affordance.

Expanded state may add:

- the larger or more detailed visualization;
- methods and denominator;
- explanatory text;
- caveats and missingness;
- evidence excerpts;
- source, rights, and citation links.

Extended prose belongs here. Expansion occurs in the card; it does not navigate to a desktop figure or open a separate desktop-style inspector. The default state is closed unless the approved storyboard explicitly identifies a lead card that should open.

### 7.4 `MobileSourceDisclosure`

Citation, methodology detail, rights, and copyright remain available but folded by default. A disclosure cannot replace direct units and essential caveats that must be visible beside a chart.

## 8. Figure contract

Every primary visualization and every quantitative microchart requires a written figure contract before implementation.

The contract contains:

- figure ID and page;
- research question;
- finding stated without visual rhetoric;
- source file and source identity;
- corpus/dataset release or capture version;
- input fields;
- inclusion and exclusion rules;
- grouping and ordering;
- formula and transformation;
- denominator and unit;
- missing, zero, unavailable, and incomparable states;
- visual marks and channels;
- axis/domain/baseline rules;
- uncertainty or caveat;
- collapsed-card view, if applicable;
- expanded-card view, if applicable;
- source/rights presentation;
- production eligibility and blocker, if any.

No unlabeled mark may look quantitative. No position, size, repetition, length, area, colour, or animation may imply a statistic unless that channel is defined in the contract.

## 9. Statistical and semantic integrity

- Never place incompatible denominators on a shared quantitative scale.
- Never imply a zero where the state is not searched, unavailable, missing, or incomparable.
- Never convert approximate dates into exact dates or false intervals.
- Never present a selected-source count as population frequency.
- Never use page revision time as event, text, or publication time without an explicit basis.
- Never use visual area, height, spacing, or ordering editorially if a reader could reasonably interpret it as measured data; label editorial ordering when unavoidable.
- Preserve literal orthographic distinctions when they are the subject of study.
- Directly label units, forms, categories, and focal values.
- Desktop claims must be rechecked against current data before reuse.
- New mobile analysis must be reproducible through scripts or typed transforms, not hand-authored arrays hidden in components.

## 10. Text policy

The mobile edition retains knowledge, not desktop paragraph structure.

- Always-visible text is concise and subordinate to figures.
- Each report movement begins with a result, question, or number rather than a long setup paragraph.
- One visible sentence should normally be enough to explain the immediate finding.
- Longer interpretation, research method, caveats, and source notes move into expandable cards.
- Definitions and essential chart-reading instructions stay adjacent to the relevant marks.
- Do not copy an entire desktop analytical paragraph or preserve desktop paragraph order merely because its facts remain valid.
- Copyright and extended rights information are folded by default.

## 11. Interaction and accessibility

- Core meaning must not depend on hover.
- Swipe is an enhancement to a complete ordered card set, not the only way to discover that cards exist.
- Accordion controls require programmatic expanded state and at least a 44 × 44 px touch target.
- Charts require direct labels and accessible summaries.
- Colour is never the only distinction.
- Visible text should normally be at least 13 px; key body copy should normally be 15–17 px.
- Respect reduced motion.
- Avoid mobile Three.js, WebGL, and gratuitous Canvas when static HTML/SVG can communicate the finding.
- A swipe rail may scroll horizontally; the document body may not.
- The page remains readable at 200% zoom and narrow reflow.

## 12. Required workflow

1. **Inventory:** locate the actual data, scripts, types, sources, and current mobile/desktop boundaries.
2. **Audit:** determine what is valid, comparable, missing, or blocked.
3. **Analyze:** calculate page-specific findings, including new mobile-only analyses supported by the data.
4. **Contract:** write figure and card contracts.
5. **Predesign:** produce the complete 390 px storyboard, reference mapping, swipe order, accordion states, and 60 / 30 / 10 audit.
6. **User review:** stop and obtain explicit visual/research approval.
7. **Implement:** create independent mobile components and styles without changing desktop.
8. **Verify:** test data correctness, interactions, accessibility, layout, and desktop non-regression.
9. **Visual acceptance:** provide screenshots and interaction evidence; do not declare design acceptance on the user’s behalf.

## 13. Verification evidence

At minimum, provide:

- full-page screenshots at 390 px and 430 px;
- representative collapsed and expanded card screenshots;
- swipe-rail start, intermediate, and final states;
- reference-versus-implementation geometry comparison;
- a page surface-area audit for 60 / 30 / 10;
- an import audit showing mobile pages do not import desktop figure/page components;
- a figure-contract-to-rendered-mark spot check;
- direct verification of units, axes, denominators, missingness, and source labels;
- body overflow and narrow-reflow checks;
- keyboard, touch, reduced-motion, and accordion-state checks;
- console and hydration checks;
- a desktop screenshot proving no visible regression.

Passing build and typecheck are necessary but never constitute visual acceptance.

## 14. Prohibited failure modes

The following outcomes fail the task even if the build passes:

- “mobile redesign” implemented as spacing, font-size, or breakpoint changes;
- desktop figures stacked into one column;
- desktop analytical prose reused as the mobile page skeleton;
- missing desktop visualization used to justify no mobile visualization;
- existing desktop analysis treated as the maximum permissible analytical depth;
- giant typography and empty space used to simulate a data-led page;
- decorative blocks, repeated words, or shapes that imply nonexistent quantities;
- generic cards containing mostly prose;
- swipe cards without an adjacent-card cue;
- accordions whose collapsed state contains no useful data;
- critical meaning hidden behind hover or animation;
- internal data-gate, audit, or implementation language shown as the public word study;
- a “minimal viable” or “smallest change” interpretation of an explicit redesign request;
- claiming `DESIGN_ACCEPTED=true` without explicit user visual acceptance.

## 15. Art-direction ownership

One lead agent must own the complete mobile visual system and maintain coherence across pages. Do not distribute independent art direction among many agents. Additional agents, when explicitly useful, may perform bounded data audits or verification, but they do not invent competing page concepts or reinterpret this governance.

The lead agent must surface conflicts and evidence gaps. It must not silently shrink the task to fit existing code, existing desktop figures, available components, or remaining time.

## 16. Completion definition

A mobile word-study page is complete only when:

- its research findings have been traced to valid data;
- new data analysis required by the mobile story has been completed or explicitly blocked;
- the user approved its predesign;
- its primary composition satisfies the approved 60 / 30 / 10 allocation;
- its major figures are mobile-native and data-rich;
- its swipe and accordion card system behaves as approved;
- its reference replication has been visually checked;
- long text is folded without hiding essential units or caveats;
- desktop remains unchanged;
- the user has reviewed the final visual evidence.

Until those conditions are met, use `READY_FOR_USER_VISUAL_ACCEPTANCE=false` and do not describe the mobile redesign as finished.

<!-- END WORDS_OVER_TIME_MOBILE_DESIGN_GOVERNANCE -->

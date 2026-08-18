# Hub mobile implementation and maintenance notes

Status: release-candidate documentation, 2026-08-18.

Scope: the mobile edition of `/words/hub` at viewport widths up to 500 px.
Desktop Hub remains a separate composition and does not import any mobile
figure or atmosphere component.

## Editorial and visual thesis

The page treats *hub* as a stable relational idea whose surrounding system
changes. The visual design therefore keeps one continuous field behind the
entire report while the field's colour balance and shape change with the
reader's position and selections.

The system has four deliberate layers:

1. A warm paper base keeps the project connected to the Words Over Time print
   language and maintains black-text contrast.
2. Three large chromatic bodies form the ambient field. Their placement and
   palette change by research movement, but the field remains fixed to the
   visual viewport so section boundaries never cut it.
3. Section veils add a translucent paper reading plane without creating card
   shells. Charts receive a slightly stronger local paper plane so axes remain
   legible.
4. Fine static grain prevents flat digital banding. Grain never carries data
   and never moves.

The colour field is non-quantitative. Quantitative meaning stays in axes,
position, line length, percentages, labels, and values.

## Mobile-only program boundary

The route uses `HubEditionBoundary` to select the independent mobile research
edition at 500 px and below. Above that boundary, the existing desktop
`HubPoster` and `WordPageShell` render unchanged.

Runtime files:

- `src/app/words/hub/page.tsx` — route composition and desktop/mobile boundary.
- `src/app/words/hub/layout.tsx` — route viewport and safe-area colour metadata.
- `src/components/hub/HubEditionBoundary.tsx` — mobile-only breakpoint switch.
- `src/components/hub/mobile/MobileHubStudy.tsx` — mobile reading order.
- `src/components/hub/mobile/HubAtmosphere.tsx` — fixed atmosphere state,
  rendering, scene observation, and linked diffusion.
- `src/components/hub/mobile/HubChromaticFields.tsx` — the single-path semantic
  navigation body.
- `src/components/hub/mobile/HubLinePlot.tsx` — shared mobile line-plot grammar.
- `src/components/hub/mobile/HubTrendExplorer.tsx` — six-family shared-scale
  frequency comparison.
- `src/components/hub/mobile/HubEvidenceRail.tsx` — evidence swipe and native
  disclosure behaviour.
- `src/components/hub/mobile/HubVisibilityChart.tsx` — fixed-inventory 0–100%
  visibility comparison.
- `src/components/hub/mobile/HubPersistenceScatter.tsx` — persistence versus
  late-period change.
- `src/components/hub/mobile/HubPhraseExplorer.tsx` — one-step phrase swipe and
  absolute/shape views.
- `src/components/hub/mobile/mobile-hub.module.css` — mobile layout, paper
  veils, safe areas, touch targets, and reduced-motion fallback.

Data and reproducibility files:

- `src/data/generated/hub_mobile_analysis.json`
- `src/data/hubMobileAnalysis.ts`
- `src/types/hubMobileAnalysis.ts`
- `scripts/build_hub_mobile_analysis.ts`
- `docs/research/hub/mobile-2026-08/hub_mobile_analysis.json`
- `scripts/audit-hub-mobile.mjs`

## Atmosphere architecture

`HubAtmosphereProvider` owns one state object for the complete mobile route.
The state contains the active scene, palette, deterministic form index, layout,
and pulse key. State and actions use separate contexts so components that only
dispatch a selection do not subscribe to every ambient frame.

`HubAtmosphereViewport` is rendered once and remains fixed with `inset: 0`.
Its cloud renderer uses two persistent banks so an incoming scene can be
rasterized offscreen before it replaces the visible scene. It contains:

- two banks of three local cloud surfaces, each surface containing halo, body,
  and inner filtered paths (eighteen persistent filtered paths in total);
- one slow ambient line;
- one temporary global diffusion path;
- one static turbulence-grain layer.

The six source paths are deterministic Bézier forms. Runtime randomness is
prohibited because it would produce hydration mismatches and make visual
regressions irreproducible. Form changes are applied at scene activation inside
the affected local cloud surface; they are not interpolated across the whole
viewport every frame.

The three filtered levels in each visible cloud serve different visual
purposes:

- inner: local colour energy;
- body: blended chromatic mass;
- halo: long-distance alpha decay.

Blur radius, turbulence frequency, and filter bounds remain static. The
paper-colour viewport gradient stays resident, while each cloud is rasterized
inside a local SVG surface. A target scene is first written into the hidden
bank; after two animation frames, the two banks crossfade only their wrapper
opacity. Visible filtered paths never change `d`, fill, position, or scale in
place. This removes the stretched-filter raster that previously appeared as a
horizontal scan band during a card change.

Only the active bank runs the slow compositor drift. The inactive bank keeps
all nine filtered paths mounted but does no continuous transform work. Local
SVG overflow is visible so the 45 px halo can decay naturally; clipping is
performed once at the viewport stack rather than at every cloud surface.
Incoming cloud gradients keep a dominant local hue and a separate chromatic
core. Colours mix where cloud surfaces overlap, not by putting the complete
three-colour palette inside every single cloud.

## Scene model

Each research movement registers exactly one `useInView` observer through
`useHubAtmosphereScene`.

| Scene | Narrative role | Dominant relationship |
| --- | --- | --- |
| hero | establish the travelling centre | coral/orange against blue/violet |
| semantic | distinguish six kinds of centre | warm origin against violet field |
| trend | compare family frequencies | pink/blue with green counterweight |
| evidence | anchor semantic shifts | coral/blue with yellow evidence light |
| visibility | show fixed-inventory expansion | orange/blue with green growth |
| scatter | compare persistence and change | pink/blue with restrained green |
| phrase | follow one phrase through time | family colour against blue/yellow |
| closing | recombine the argument | hero palette in a quieter distribution |

An observer activates through one narrow viewport band. The band prevents two
long adjacent sections from repeatedly claiming the atmosphere at the same
time, while still changing the scene before the incoming heading reaches the
middle of the viewport. Scrolling does not restart animation on every scroll
event.

Family, evidence, and phrase selection can call `activate` with a local palette,
form index, and `pulse: true`. A monotonically increasing `pulseKey` guarantees
one diffusion response per completed selection and prevents old pulses from
accumulating. Absolute/shape mode changes do not recolour the page because they
change chart interpretation, not semantic family.

## Motion language

The animation is designed as slow ink diffusion rather than floating bubbles.

| Response | Duration | Easing |
| --- | ---: | --- |
| prepared bank crossfade | 0.34–0.46 s | `[0.4, 0, 0.2, 1]` |
| hidden-bank prepaint | two animation frames | none |
| linked card diffusion | 1.45–1.75 s | soft ease |
| interaction state | 0.45–0.65 s | soft ease |
| local compositor drift | 23–29 s | ease-in-out |
| ambient line | 15 s | linear |

Drift displacement is deliberately small. Visible filtered surfaces never
change scale. There are no springs, bounce, overshoot, animated blur
parameters, or runtime random paths.

`MotionConfig reducedMotion="user"` is the route-level policy. With reduced
motion enabled, drift, diffusion, positional change, and scale animation stop.
Only a very short colour cross-fade remains so content changes are still
understandable.

## Safe-area design

Safe areas are part of the page composition, not separate coloured bars.

- The Hub route exports `viewportFit: "cover"` from its server layout.
- The route `themeColor` and `html`/`body` fallback are the same paper colour,
  `#fcfaf3`.
- The fixed atmosphere always covers `inset: 0`; it is never offset by safe-area
  variables.
- Stable top and bottom paper veils fade into the dynamic field. This prevents
  a yellow, blue, or violet body from being visibly clipped by Safari chrome
  when the active scene changes.
- Only content receives `env(safe-area-inset-top)` or
  `env(safe-area-inset-bottom)` padding.
- Height fallbacks are declared in `vh`, `svh`, and `dvh` order for current
  Safari and Chrome visual viewports.

Do not dynamically rewrite the viewport meta tag from a client component.
Do not make the browser theme colour follow the current family palette. Either
change would reintroduce colour flashes between sections and could desynchronise
Safari chrome from the page.

## Semantic field

The Meaning Field uses one hand-authored, asymmetric Bézier silhouette. It is
the only outer boundary. Internal family circles distribute colour inside a
shared mask but never generate the silhouette. This preserves convex lobes,
concavities, necks, and unequal curvature without returning to a six-bubble
metaball construction.

The shape is semantic navigation, not an area chart. The permanent measure line
states that distinction; detailed historical and corpus limits remain in the
folded method disclosure.

## Swipe and selection stability

- Evidence cards use native horizontal scroll snap and keep an adjacent-card
  cue. Open details collapse before horizontal movement so the next card never
  arrives with empty expanded-state space.
- Evidence active state is derived from the rail's scroll position, so swiping
  and arrow navigation share one source of truth.
- Phrase and scatter selection rails limit a completed gesture to one item.
- Touch controls keep at least a 44–48 px target; visible outlines are reserved
  for keyboard `:focus-visible`, not persistent decoration.
- SVG marks use larger transparent hit targets where the drawn point is too
  small to touch reliably.

## Data contract and editorial limits

The production analysis contains 39 successful selected two-token phrase
proxies across six twenty-year periods. Visibility uses a fixed threshold of
0.002 occurrences per million and a fixed denominator of 39 for the percentage
figure. Family trends use unweighted arithmetic means of the selected phrases.

Google Books Ngram is a printed-book frequency proxy. It is not a population
usage rate and does not prove a historical first use. Evidence dates distinguish
dictionary claims from direct text. Missing and failed captures are never
converted to zero.

When regenerating data, run the build script and review the generated diff
before changing copy. Never edit the generated JSON to fit a visual claim.

## Maintenance checklist

When changing the atmosphere:

1. Keep all `CLOUD_FORMS` deterministic and compatible in path topology.
2. Keep filter IDs instance-safe through `useId`.
3. Do not add one full SVG atmosphere per card or section.
4. Do not animate `stdDeviation`, `baseFrequency`, CSS `filter`, or the scale
   of a visible filtered surface.
5. Keep the paper safe-area veils independent of scene palette.
6. Verify the fixed layer does not create document-level horizontal overflow.
7. Test both normal and reduced-motion settings after timing changes.
8. Keep the filtered-path contract at eighteen persistent paths: two banks,
   each with three bounded clouds containing halo, body, and inner paths. Do
   not merge them into one giant surface or mutate a visible bank's path.
9. During a rapid interaction burst, keep only the latest queued scene. Finish
   the current crossfade, then prepare that target and discard stale
   intermediate scenes.

When changing a selector or swipe rail:

1. Update visible text, chart state, and atmosphere in the same event.
2. Preserve one-step phrase movement and evidence snap alignment.
3. Ensure inactive content does not keep running its own SVG animation.
4. Test keyboard activation and `aria-pressed`/expanded state.
5. Lock programmatic evidence-rail movement to its target index until scrolling
   settles; intermediate rail positions must not dispatch atmosphere scenes.

When changing charts:

1. Preserve units, domains, zero lines, fixed denominators, and missingness.
2. Keep the plot paper plane translucent; an opaque section background would
   break the continuous atmosphere.
3. Run `node scripts/audit-hub-mobile.mjs`, `npm run typecheck`, and
   `npm run build`.
4. Recheck 390×844 and 430×932, Safari safe areas, reduced motion, body
   overflow, and desktop non-regression.

## Description note for future maintenance

This release replaces in-place mutation of visible filtered paths with a
two-bank prepaint-and-crossfade compositor. The extra bank is intentional: it
keeps all eighteen filtered paths resident while allowing the next atmosphere
to rasterize before it becomes visible. Do not simplify this back to one bank,
add an unbounded `AnimatePresence` exit stack, or animate a visible path's `d`,
scale, blur, or filter parameters. Those changes can recreate the delayed
repaint and horizontal X-ray scan band that prompted this repair.

The evidence rail's programmatic target lock is also part of atmosphere
correctness. During a smooth one-card move, intermediate scroll positions must
not dispatch extra evidence scenes. If the rail timing changes, update and test
the lock together with the scroll behaviour rather than removing it in
isolation.

Known maintenance risks to watch:

- Rapid scene requests inside one 420 ms crossfade intentionally coalesce to
  the latest target. Content still updates immediately, but an intermediate
  atmosphere may be skipped. A future feature that requires every intermediate
  scene needs a bounded queue design, not a shorter or absent lock.
- Eighteen persistent filtered paths use more GPU memory than the previous
  nine-path renderer. The inactive bank therefore must remain static. On
  low-memory Safari, watch for a single delayed frame caused by surface-cache
  eviction; do not address it by adding a third bank or reducing the filtered
  path contract.
- The narrow scene-observation band assumes sections remain contiguous in
  normal document flow. A future sticky, overlapping, or portal-rendered
  section could claim the wrong scene and requires a new ownership rule.
- Local cloud SVG overflow must remain visible, with clipping performed only by
  the outer viewport stack. Restoring per-cloud clipping will cut the halo and
  can make the crossfade look like a rectangular scan.
- `useId`-derived filter, gradient, mask, and pulse IDs must remain unique
  across both banks. Duplicated IDs can show the wrong colour or filter only in
  Safari, making the failure appear device-specific.
- The final compositor was verified in Chromium at 390×844 and 430×932. The
  Safari code path keeps `viewport-fit=cover`, paper-colour browser chrome, and
  reduced-motion fallbacks, but a physical-device Safari spot check remains a
  release-monitoring item because Simulator testing was intentionally stopped.

These are maintenance risks, not known current production failures. If a
future report describes slow colour refresh, first capture the active bank,
incoming bank, `pulseKey`, and rail target-lock state before changing visual
timings.

## Release verification evidence

Local release-candidate images are retained outside the code commit in:

`docs/evidence/hub-mobile-release-2026-08-18/`

The local set includes Hub Hero, Evidence, Closing, normal-motion frames,
reduced-motion frames, and top/closing comparisons for Privacy and Artificial.
The comparison pages establish the project-level rule: light studies use a
stable paper safe area, while the dark Artificial study uses its stable black
field. Dynamic section colour never determines browser-chrome colour.

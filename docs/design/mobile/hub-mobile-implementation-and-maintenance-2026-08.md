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
It contains at most:

- three local cloud surfaces, each containing halo, body, and inner filtered
  paths (nine persistent filtered paths in total);
- one slow ambient line;
- one temporary global diffusion path;
- one static turbulence-grain layer.

The six source paths are deterministic Bézier forms. Runtime randomness is
prohibited because it would produce hydration mismatches and make visual
regressions irreproducible. Form changes are applied at scene activation inside
the affected local cloud surface; they are not interpolated across the whole
viewport every frame.

The three visible cloud levels serve different visual purposes:

- inner: local colour energy;
- body: blended chromatic mass;
- halo: long-distance alpha decay.

Blur radius, turbulence frequency, and filter bounds remain static. Motion only
animates fill, transform, and opacity. The paper-colour viewport gradient stays
resident, while each cloud is rasterized in a bounded SVG surface. Scene
position, scale, and slow drift happen on nested HTML compositing layers;
palette or form changes repaint only the affected cloud bounds. This preserves
all nine filtered paths without asking mobile Safari to redraw one full-screen
filtered SVG for every ambient frame.

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

An observer activates as the incoming section first becomes legible (8% visible
inside the route observation band), so the atmosphere is already responding
before the heading reaches the middle of the viewport. Scrolling does not
restart animation on every scroll event.

Family, evidence, and phrase selection can call `activate` with a local palette,
form index, and `pulse: true`. A monotonically increasing `pulseKey` guarantees
one diffusion response per completed selection and prevents old pulses from
accumulating. Absolute/shape mode changes do not recolour the page because they
change chart interpretation, not semantic family.

## Motion language

The animation is designed as slow ink diffusion rather than floating bubbles.

| Response | Duration | Easing |
| --- | ---: | --- |
| section position/scale response | 0.92 s | `[0.22, 1, 0.36, 1]` |
| palette/opacity transition | 0.62 s | `[0.4, 0, 0.2, 1]` |
| linked card diffusion | 1.45–1.75 s | soft ease |
| interaction state | 0.45–0.65 s | soft ease |
| local compositor drift | 23–29 s | ease-in-out |
| ambient line | 15 s | linear |

Drift displacement is deliberately small and scale change remains restrained.
There are no springs, bounce, overshoot, animated blur parameters, or runtime
random paths.

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
4. Do not animate `stdDeviation`, `baseFrequency`, or CSS `filter`.
5. Keep the paper safe-area veils independent of scene palette.
6. Verify the fixed layer does not create document-level horizontal overflow.
7. Test both normal and reduced-motion settings after timing changes.
8. Keep the filtered-path contract at nine persistent paths: three bounded
   clouds × halo/body/inner. Do not merge them into one full-viewport repaint
   surface or attach continuous transform animation directly to filtered paths.

When changing a selector or swipe rail:

1. Update visible text, chart state, and atmosphere in the same event.
2. Preserve one-step phrase movement and evidence snap alignment.
3. Ensure inactive content does not keep running its own SVG animation.
4. Test keyboard activation and `aria-pressed`/expanded state.

When changing charts:

1. Preserve units, domains, zero lines, fixed denominators, and missingness.
2. Keep the plot paper plane translucent; an opaque section background would
   break the continuous atmosphere.
3. Run `node scripts/audit-hub-mobile.mjs`, `npm run typecheck`, and
   `npm run build`.
4. Recheck 390×844 and 430×932, Safari safe areas, reduced motion, body
   overflow, and desktop non-regression.

## Release verification evidence

Local release-candidate images are retained outside the code commit in:

`docs/evidence/hub-mobile-release-2026-08-18/`

The local set includes Hub Hero, Evidence, Closing, normal-motion frames,
reduced-motion frames, and top/closing comparisons for Privacy and Artificial.
The comparison pages establish the project-level rule: light studies use a
stable paper safe area, while the dark Artificial study uses its stable black
field. Dynamic section colour never determines browser-chrome colour.

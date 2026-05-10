# Chart 3 Mechanical Reproduction Collection Log

Generated: 2026-05-10T11:34:28.989Z

## Script

- `scripts/fetch_chart_03_reproduction.ts`

## Chart Frame

Chart 3 is collecting data for: artificial object -> artificial image / sound / light / scene -> reproducible experience -> authenticity pressure.

This pass treats `authentic`, `authenticity`, `genuine`, `original`, and `originality` as counter-terms, not artificial modifiers. They should be aligned against the artificial/media timeline rather than interpreted as part of the artificial phrase family.

## Source Method

- Source: Google Books Ngram Viewer
- Endpoint: `https://books.google.com/ngrams/json`
- Output root: `docs/research/artificial/chart_03_mechanical_reproduction`
- Corpus: `en` (English)
- Date range: 1800-2019
- Smoothing: 0
- Case-sensitive query: false
- Case-insensitive parameter: true
- Query batching: 8 terms per request, with single-term retry after batch failure

## Terms Attempted

### a_narrative_spine

- photograph: photographic image baseline; helps define the reproduction-era window
- photography: photographic technology baseline; helps define the reproduction-era window
- authentic: counter-term for authenticity pressure; compare against artificial/media terms
- authenticity: counter-term for authenticity pressure; likely strong but not an artificial modifier
- artificial sound: sound reproduction line: phonograph, radio, recording
- artificial lighting: staged/cinematic perception manufacturing, distinct from artificial light

### b_supporting_evidence

- mechanical reproduction: direct Benjamin-line academic/theoretical bridge
- artificial atmosphere: theater/exhibition/environmental perception manufacturing
- recorded: broad emergence of recording as a media action; sense-noisy but useful
- artificial daylight: studio lighting / artificial sun / film-production specificity
- simulation: late-tail bridge paired with simulated

### c_optional_density

- reproduced: general reproduction vocabulary
- reproduction: general reproduction vocabulary and Benjamin-line context
- artificial color: color reproduction via print, dye, film, and manufactured perception
- artificial colour: British spelling variant for artificial color
- aura: Benjamin aura concept; broad and sense-noisy in ordinary language
- artificial scene: constructed scene/environment candidate
- artificial environment: later constructed-environment candidate

### media_technology_anchor

- phonograph: sound reproduction technology anchor
- gramophone: sound reproduction technology anchor, especially British usage
- recorded sound: specific sound-reproduction phrase
- sound recording: specific recording practice phrase
- moving picture: early motion-picture vocabulary
- motion picture: film/cinema reproduction technology anchor
- cinematograph: early cinema technology anchor
- radio broadcasting: broadcast-mediated sound reproduction anchor
- photographic reproduction: direct image-copying bridge between photography and reproduction
- facsimile: copy/reproduction term that may precede mass media discourse

### authenticity_counterterm

- genuine: counter-pressure around original/real/genuine status; broad but useful comparator
- original: counter-pressure around original status; very broad and sense-noisy
- originality: authorship/originality pressure around reproducibility
- fake: negative authenticity-pressure comparator from the existing artificial dataset
- simulated: existing artificial core term; pairs with simulation for late-tail pressure
- artificial image: image/manufactured-perception phrase from existing test set, now Chart 3 relevant
- artificial voice: voice/sound manufacturing phrase from existing secondary set, now Chart 3 relevant

## Status

- Terms attempted: 35
- Successfully collected: 35
- Missing: 0
- Too sparse: 0
- Errored: 0

## Strongest Visible Frequency Signals

- original: peak 129.4605035582208 per million
- recorded: peak 48.24558575236559 per million
- simulation: peak 36.13882060950202 per million
- fake: peak 24.23141073037982 per million
- reproduction: peak 22.62134112054198 per million
- genuine: peak 22.48363314549806 per million
- sound recording: peak 16.26489118933261 per million
- reproduced: peak 16.120166399957725 per million
- motion picture: peak 16.06664519343548 per million
- facsimile: peak 15.746205576760985 per million
- photograph: peak 15.401675163822375 per million
- photography: peak 14.289268080364126 per million
- authentic: peak 11.929448930914077 per million
- aura: peak 11.528617012229736 per million
- simulated: peak 10.78187738889902 per million
- authenticity: peak 6.509749820082789 per million

## Missing Terms

- None

## Too Sparse Terms

- None

## Errored Terms

- None

## Request URLs

- https://books.google.com/ngrams/json?content=photograph%2Cphotography%2Cauthentic%2Cauthenticity%2Cartificial+sound%2Cartificial+lighting&year_start=1800&year_end=2019&corpus=en&smoothing=0&case_insensitive=true
- https://books.google.com/ngrams/json?content=mechanical+reproduction%2Cartificial+atmosphere%2Crecorded%2Cartificial+daylight%2Csimulation&year_start=1800&year_end=2019&corpus=en&smoothing=0&case_insensitive=true
- https://books.google.com/ngrams/json?content=reproduced%2Creproduction%2Cartificial+color%2Cartificial+colour%2Caura%2Cartificial+scene%2Cartificial+environment&year_start=1800&year_end=2019&corpus=en&smoothing=0&case_insensitive=true
- https://books.google.com/ngrams/json?content=phonograph%2Cgramophone%2Crecorded+sound%2Csound+recording%2Cmoving+picture%2Cmotion+picture%2Ccinematograph%2Cradio+broadcasting&year_start=1800&year_end=2019&corpus=en&smoothing=0&case_insensitive=true
- https://books.google.com/ngrams/json?content=photographic+reproduction%2Cfacsimile&year_start=1800&year_end=2019&corpus=en&smoothing=0&case_insensitive=true
- https://books.google.com/ngrams/json?content=genuine%2Coriginal%2Coriginality%2Cfake%2Csimulated%2Cartificial+image%2Cartificial+voice&year_start=1800&year_end=2019&corpus=en&smoothing=0&case_insensitive=true

## Assumptions

- A/B/C terms follow the user's priority structure.
- Media technology anchors were added to help locate the chart's reproduction-era window.
- Authenticity counter-terms were added because Chart 3 needs a visible pressure field around reproducibility, originality, and genuineness.
- Broad terms such as `recorded`, `original`, `aura`, and `genuine` are intentionally sense-noisy and must be interpreted only as background pressure.
- Values are raw Google Ngram fractions; per-million columns multiply those values by 1,000,000 for readability.

## Unresolved Issues

- Ngram does not disambiguate senses.
- Rare phrases can be missing or suppressed by phrase thresholds.
- `mechanical reproduction`, `aura`, and `authenticity` need later source/context checks before Benjamin-related claims are written.
- Technical-media terms may require newspaper, patent, trade, or film/recording history sources in a later round.

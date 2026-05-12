# Chart 4 Suspicion / Semantic Distance Collection Log

Generated: 2026-05-12T11:20:37.272Z

## Script

- `scripts/fetch_chart_04_suspicion_distance.ts`

## Scope

This is a first-round data collection pass only. It does not design Chart 4, implement visualization, decide whether Chart 4A and Chart 4B become one or two charts, or write final chart copy.

## Source Method

- Source: Google Books Ngram Viewer
- Endpoint: `https://books.google.com/ngrams/json`
- Output root: `docs/research/artificial/chart_04_suspicion_distance`
- Corpus: `en` (English)
- Date range: 1800-2019
- Smoothing: 0
- Case-sensitive query: false
- Case-insensitive parameter: true
- Query batching: 8 terms per request, with single-term retry after batch failure

## Terms Attempted

### core_baseline

- artificial
- artificially
- artificiality
- artifice
- natural
- real
- realistic
- fake
- genuine
- synthetic
- imitation
- simulated
- constructed
- processed
- manufactured
- man-made
- man made
- human-made
- human made
- machine-made
- machine made

### suspicion_negative

- artificial smile
- artificial manner
- artificial manners
- artificial style
- artificial expression
- artificial behaviour
- artificial behavior
- artificial sentiment
- artificial passion
- artificial emotion
- artificial feeling
- artificial tears
- artificial politeness
- artificial society
- artificial life
- artificial world
- artificial taste
- artificial charm
- artificial elegance
- artificial refinement
- artificial simplicity
- artificial constraint

### semantic_distance

- artificial intelligence
- artificial life
- artificial language
- artificial image
- artificial voice
- artificial sound
- artificial scene
- artificial scenery
- artificial effect
- artificial effects
- realistic
- realism
- unrealistic
- unreal
- not real
- not genuine
- genuine
- authentic
- authenticity
- inauthentic
- fake
- falseness
- false
- counterfeit
- sham
- imitation
- synthetic
- simulated
- simulation

### natural_opposition_pair

- artificial light
- natural light
- artificial flavor
- natural flavor
- artificial flavour
- natural flavour
- artificial color
- natural color
- artificial colour
- natural colour
- artificial ingredients
- natural ingredients
- artificial sweetener
- natural sweetener
- artificial selection
- natural selection
- artificial language
- natural language
- artificial intelligence
- natural intelligence
- artificial life
- natural life

### consumer_packaging

- artificial ingredients
- artificial flavor
- artificial flavour
- artificial color
- artificial colour
- artificial colors
- artificial colours
- artificial sweetener
- artificial sweeteners
- artificial preservatives
- artificial additives
- artificially flavored
- artificially flavoured
- artificially colored
- artificially coloured

### absence_claim

- no artificial ingredients
- no artificial flavors
- no artificial flavours
- no artificial colors
- no artificial colours
- no artificial preservatives
- nothing artificial
- free from artificial
- without artificial
- contains no artificial
- all natural
- clean label
- real ingredients
- simple ingredients

### optional

- artificial chemicals
- artificial chemical
- artificial dyes
- artificial dye
- artificial colouring
- artificial coloring
- artificial substance
- artificial substances
- artificial material
- artificial materials
- artificial product
- artificial products
- artificial substitute
- artificial substitutes
- artificial imitation
- artificial copy
- artificial copies

## Status

- Terms attempted: 140
- Successfully collected: 137
- Missing: 3
- Too sparse: 0
- Errored: 0

## Terms Missing

- man-made [core_baseline]
- human-made [core_baseline]
- machine-made [core_baseline]

## Too Sparse Terms

- None

## Errors

- None

## Manual Fixes

- None. Values were written directly from the Ngram JSON time series into raw and processed CSV files.

## Assumptions

- Google Books Ngram is used only as broad frequency / visibility evidence.
- The English corpus, 1800-2019 range, smoothing 0, and case-insensitive aggregate rows match earlier artificial data rounds.
- Returned `term (All)` aggregate rows are preferred for case-insensitive queries.
- Duplicate phrases are intentionally preserved across different query groups when they serve different research roles.
- Terms with one to three nonzero years are marked `too_sparse`.
- Optional terms were collected because the same workflow handled the required groups cleanly.
- `first_nonzero_year` is not treated as earliest attestation.

## Request URLs

- https://books.google.com/ngrams/json?content=artificial%2Cartificially%2Cartificiality%2Cartifice%2Cnatural%2Creal%2Crealistic%2Cfake&year_start=1800&year_end=2019&corpus=en&smoothing=0&case_insensitive=true
- https://books.google.com/ngrams/json?content=genuine%2Csynthetic%2Cimitation%2Csimulated%2Cconstructed%2Cprocessed%2Cmanufactured%2Cman-made&year_start=1800&year_end=2019&corpus=en&smoothing=0&case_insensitive=true
- https://books.google.com/ngrams/json?content=man+made%2Chuman-made%2Chuman+made%2Cmachine-made%2Cmachine+made&year_start=1800&year_end=2019&corpus=en&smoothing=0&case_insensitive=true
- https://books.google.com/ngrams/json?content=artificial+smile%2Cartificial+manner%2Cartificial+manners%2Cartificial+style%2Cartificial+expression%2Cartificial+behaviour%2Cartificial+behavior%2Cartificial+sentiment&year_start=1800&year_end=2019&corpus=en&smoothing=0&case_insensitive=true
- https://books.google.com/ngrams/json?content=artificial+passion%2Cartificial+emotion%2Cartificial+feeling%2Cartificial+tears%2Cartificial+politeness%2Cartificial+society%2Cartificial+life%2Cartificial+world&year_start=1800&year_end=2019&corpus=en&smoothing=0&case_insensitive=true
- https://books.google.com/ngrams/json?content=artificial+taste%2Cartificial+charm%2Cartificial+elegance%2Cartificial+refinement%2Cartificial+simplicity%2Cartificial+constraint&year_start=1800&year_end=2019&corpus=en&smoothing=0&case_insensitive=true
- https://books.google.com/ngrams/json?content=artificial+intelligence%2Cartificial+life%2Cartificial+language%2Cartificial+image%2Cartificial+voice%2Cartificial+sound%2Cartificial+scene%2Cartificial+scenery&year_start=1800&year_end=2019&corpus=en&smoothing=0&case_insensitive=true
- https://books.google.com/ngrams/json?content=artificial+effect%2Cartificial+effects%2Crealistic%2Crealism%2Cunrealistic%2Cunreal%2Cnot+real%2Cnot+genuine&year_start=1800&year_end=2019&corpus=en&smoothing=0&case_insensitive=true
- https://books.google.com/ngrams/json?content=genuine%2Cauthentic%2Cauthenticity%2Cinauthentic%2Cfake%2Cfalseness%2Cfalse%2Ccounterfeit&year_start=1800&year_end=2019&corpus=en&smoothing=0&case_insensitive=true
- https://books.google.com/ngrams/json?content=sham%2Cimitation%2Csynthetic%2Csimulated%2Csimulation&year_start=1800&year_end=2019&corpus=en&smoothing=0&case_insensitive=true
- https://books.google.com/ngrams/json?content=artificial+light%2Cnatural+light%2Cartificial+flavor%2Cnatural+flavor%2Cartificial+flavour%2Cnatural+flavour%2Cartificial+color%2Cnatural+color&year_start=1800&year_end=2019&corpus=en&smoothing=0&case_insensitive=true
- https://books.google.com/ngrams/json?content=artificial+colour%2Cnatural+colour%2Cartificial+ingredients%2Cnatural+ingredients%2Cartificial+sweetener%2Cnatural+sweetener%2Cartificial+selection%2Cnatural+selection&year_start=1800&year_end=2019&corpus=en&smoothing=0&case_insensitive=true
- https://books.google.com/ngrams/json?content=artificial+language%2Cnatural+language%2Cartificial+intelligence%2Cnatural+intelligence%2Cartificial+life%2Cnatural+life&year_start=1800&year_end=2019&corpus=en&smoothing=0&case_insensitive=true
- https://books.google.com/ngrams/json?content=artificial+ingredients%2Cartificial+flavor%2Cartificial+flavour%2Cartificial+color%2Cartificial+colour%2Cartificial+colors%2Cartificial+colours%2Cartificial+sweetener&year_start=1800&year_end=2019&corpus=en&smoothing=0&case_insensitive=true
- https://books.google.com/ngrams/json?content=artificial+sweeteners%2Cartificial+preservatives%2Cartificial+additives%2Cartificially+flavored%2Cartificially+flavoured%2Cartificially+colored%2Cartificially+coloured&year_start=1800&year_end=2019&corpus=en&smoothing=0&case_insensitive=true
- https://books.google.com/ngrams/json?content=no+artificial+ingredients%2Cno+artificial+flavors%2Cno+artificial+flavours%2Cno+artificial+colors%2Cno+artificial+colours%2Cno+artificial+preservatives%2Cnothing+artificial%2Cfree+from+artificial&year_start=1800&year_end=2019&corpus=en&smoothing=0&case_insensitive=true
- https://books.google.com/ngrams/json?content=without+artificial%2Ccontains+no+artificial%2Call+natural%2Cclean+label%2Creal+ingredients%2Csimple+ingredients&year_start=1800&year_end=2019&corpus=en&smoothing=0&case_insensitive=true
- https://books.google.com/ngrams/json?content=artificial+chemicals%2Cartificial+chemical%2Cartificial+dyes%2Cartificial+dye%2Cartificial+colouring%2Cartificial+coloring%2Cartificial+substance%2Cartificial+substances&year_start=1800&year_end=2019&corpus=en&smoothing=0&case_insensitive=true
- https://books.google.com/ngrams/json?content=artificial+material%2Cartificial+materials%2Cartificial+product%2Cartificial+products%2Cartificial+substitute%2Cartificial+substitutes%2Cartificial+imitation%2Cartificial+copy&year_start=1800&year_end=2019&corpus=en&smoothing=0&case_insensitive=true
- https://books.google.com/ngrams/json?content=artificial+copies&year_start=1800&year_end=2019&corpus=en&smoothing=0&case_insensitive=true

## Unresolved Issues

- Ngram cannot show sentiment directly.
- Ngram does not disambiguate senses.
- Broad unigrams such as `natural`, `real`, and `fake` are noisy baseline terms only.
- Packaging and advertising language is likely underrepresented in books.
- Sparse phrases may still be historically useful after snippet or advertising review.

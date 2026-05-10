# Chart 3 Initial Data Reading

Generated from `scripts/fetch_chart_03_reproduction.ts`.

## Core Frame

Chart 3 can treat the reproduction era as a shift from artificial objects toward manufactured perceptual experience:

artificial object -> artificial image / sound / light / scene -> reproducible experience -> authenticity pressure

The strongest visual structure should probably not be a single term race. It should separate three streams:

- media/reproduction infrastructure: `photograph`, `photography`, `phonograph`, `gramophone`, `motion picture`, `sound recording`, `reproduction`
- artificial perception phrases: `artificial lighting`, `artificial daylight`, `artificial sound`, `artificial image`, `artificial atmosphere`, `artificial environment`
- authenticity pressure: `authentic`, `authenticity`, `genuine`, `original`, `originality`, `fake`, `simulated`, `simulation`

## Strong Signals

- `photograph` and `photography` become useful nineteenth-century baseline terms, with first-above-1-per-million dates of 1832 and 1851.
- `phonograph` crosses 1 per million in 1878, while `gramophone` crosses 1 per million in 1923.
- `moving picture` crosses 1 per million in 1908; `cinematograph` crosses 1 per million in 1912; `radio broadcasting` crosses 1 per million in 1929.
- `sound recording` is late but strong, crossing 1 per million in 1973 and peaking in 1983.
- `simulation` and `simulated` become the cleanest late-tail pair: `simulation` crosses 1 per million in 1954 and peaks in 1995; `simulated` crosses 1 per million in 1940 and also peaks in 1995.
- `authenticity` peaks late, in 2016, making it useful as the counter-pressure term rather than as a nineteenth-century origin signal.

## Artificial Perception Phrases

- `artificial lighting` is the strongest A-group phrase among the artificial perception terms. It crosses 0.1 per million in 1902 and peaks in 1925.
- `artificial daylight` is weaker but narratively useful for studio/technical lighting. It peaks in 1914.
- `artificial sound`, `artificial image`, and `artificial voice` are visible but very small; use them as texture or labels, not major quantitative anchors.
- `artificial atmosphere` and `artificial environment` are plausible environment-making phrases, but both need snippet/context checks before interpretive claims.

## Cautions

- `original`, `genuine`, `authentic`, `recorded`, `reproduction`, `aura`, and `fake` are broad terms. They should appear as pressure/background fields unless later source checks disambiguate them.
- `mechanical reproduction` is collected, but it is too theory-loaded to use as a pure historical signal without contextual review.
- `aura` has a strong ordinary-language signal and peaks in 2019; do not treat the Ngram curve itself as Benjamin-specific.
- Some early nonzero dates for media terms are likely generic senses, OCR noise, or non-media senses. Use first-above-threshold dates rather than first_nonzero_year for timeline labels.

## Recommended Next Fetch Round

- Context/snippet round for `mechanical reproduction`, `aura`, `authenticity`, `artificial lighting`, `artificial daylight`, `artificial atmosphere`, and `artificial environment`.
- Add media-specific comparators if the visual needs more structure: `photographic image`, `recorded music`, `sound film`, `talking picture`, `electric light`, `stage lighting`, `studio lighting`.
- Consider separate `en-US` and `en-GB` corpus checks for `gramophone`, `cinematograph`, `artificial colour`, and `radio broadcasting`, because national spelling and media vocabulary may matter here.

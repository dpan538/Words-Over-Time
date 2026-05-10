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

## Supplemental Fetch Reading

The second fetch round expands the dataset from 35 to 68 terms. All 33 supplemental terms were collected.

### Artificial Light And Perception

- `electric light` is the dominant lighting anchor, peaking in 1897 at 21.856 per million.
- `stage lighting` crosses 0.1 per million in 1921 and peaks in 1929.
- `artificial sunlight` crosses 0.1 per million in 1925 and peaks in 1928.
- `studio lighting` is visible but smaller, peaking in 1950 below 0.1 per million.
- `limelight` has a strong nineteenth-century stage-lighting role, but the Ngram peak is late; use with context checks.

### Sound Reproduction

- `phonographic` is a good transition-era adjective, crossing 1 per million in 1877 and peaking in 1890.
- `talking picture` and `sound film` both cross 0.1 per million in 1928, matching the sound-cinema transition.
- `recorded music` crosses 0.1 per million in 1933 and peaks in 1952.
- `synthetic sound` is collected but tiny; it is a texture term, not a structural anchor.
- `wireless` is useful but broad. Early values likely include non-broadcast senses, so use it as a British/technical background term only after snippet checks.

### Scene Manufacturing

- `panorama`, `diorama`, and `stereoscope` give Chart 3 a strong pre-cinema artificial-experience layer.
- `panorama` peaks in 1808; `diorama` crosses 0.1 per million in 1822 and peaks in 1851; `stereoscope` crosses 1 per million in 1852 and peaks in 1858.
- `moving image` is late and peaks in 1999; it is better for the conceptual tail than for early cinema.
- `projected image` and `artificial scenery` are visible but weak and need contextual validation.

### Industrial Material Background

- `mass production` is the strongest industrial background term, crossing 1 per million in 1926 and peaking in 1945.
- `mass produced` peaks later, in 1957, and is useful for consumer-object framing.
- `halftone` and `photomechanical` provide print/image-reproduction technology anchors.
- `ersatz` peaks in 1942, making it useful for wartime artificial-substitute pressure.
- `handmade` rises late and should be treated as a reverse authenticity/craft counter-term rather than a simple decline story.

### Authenticity And Late Tail

- `virtual reality` behaves cleanly as a late-tail artificial-experience term, crossing 0.1 per million in 1990 and 1 per million in 1993.
- `virtual` is too broad to use alone for digital experience because it has strong older senses.
- `imitation`, `forgery`, and `counterfeit` are strong but old/broad; they can frame authenticity anxiety but need sense controls.
- `faithful copy` is weak and old-skewed; use only as a small annotation if needed.

### Media Infrastructure

- `mass media` crosses 1 per million in 1956 and peaks in 1990.
- `stereophonic` crosses 1 per million in 1954 and peaks in 1973.
- `broadcast` and `transmission` are strong but broad. They work better as infrastructure background than as precise reproduction-specific labels.

## Third Fetch Reading

The third fetch round expands the dataset from 68 to 90 terms. All 22 additional terms were collected.

### Gap A: Pre-Cinema Apparatus

- `magic lantern` is the cleanest new bridge term, peaking in 1869. It fits the pre-cinema projection/device layer between `diorama`/`stereoscope` and later cinema vocabulary.
- `lifelike` peaks in 1871 and crosses 0.1 per million in 1847, making it a useful quality-pressure term for artificial representation.
- `automaton` crosses 1 per million in 1821, but its peak is late in 2003; use the nineteenth-century window carefully and check contexts.
- `stage effect` is visible early and peaks in 1818; this may reflect broad theatrical language rather than a clean technology term.
- `waxworks` and `theatrical illusion` were collected but are weak in Ngram. They may still be useful for snippets or annotations.

### Gap B: Television And Color Media

- `color film` is the strongest color-media term, crossing 0.1 per million in 1935, crossing 1 per million in 1954, and peaking in 1954.
- `colour film` crosses 0.1 per million in 1938 and peaks in 1966, giving a useful British-spelling comparison.
- `color photography` and `colour photography` both cross 0.1 per million in the 1890s, but peak later: 1940 and 1924 respectively.
- `television` is a major medium anchor, peaking in 1953. Its early threshold dates are not reliable as modern television signals, so label it by peak/known medium context rather than first crossing.
- `televised` is collected but has suspicious early values and peaks late in 2009; use only after contextual checks.
- `trick photography` is weak but peaks in 1897, matching the early visual-manipulation layer.
- `special effect` is much later in Ngram, crossing 0.1 per million in 1996 and peaking in 2010. It may be a CGI-era term more than an early-cinema term.

### Gap C: Digital Entry

- `computer graphics` fills the digital visual bridge best: it crosses 0.1 per million in 1967, crosses 1 per million in 1978, and peaks in 1986.
- `digital image` crosses 0.1 per million in 1974, crosses 1 per million in 1998, and peaks in 1999.
- `digital recording` peaks in 1985 and crosses 0.1 per million in 1960, but does not cross 1 per million in this corpus.
- `high fidelity` gives an earlier sound-quality bridge: it crosses 1 per million in 1953 and peaks in 1956.
- `digital reproduction` was collected but remains very small; it is a concept label, not a quantitative anchor.

### Authenticity Context

- `true to life` is the strongest J-group term, crossing 0.1 per million in 1862 and peaking in 1943. It is useful as a realism/copy-quality pressure phrase.
- `authentic experience` peaks late in 2018 but remains below 0.1 per million; use as a contemporary annotation rather than a chart spine.
- `art forgery` is very weak in Ngram; `forgery` remains the stronger broad signal.

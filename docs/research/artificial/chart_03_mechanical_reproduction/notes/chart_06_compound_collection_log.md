# Chart 06 Compound Expansion Collection Log

Generated: 2026-05-11T10:46:25.560Z

## Script

- `scripts/fetch_chart_06_compound_expansion.ts`

## Chart Frame

Chart 06 tracks how `artificial` behaves as a prefix across five semantic domains: SENSE, MATERIAL, BIOLOGICAL, COGNITIVE, and SOCIAL.

## Source Method

- Source: Google Books Ngram Viewer
- Endpoint: `https://books.google.com/ngrams/json`
- Output root: `docs/research/artificial/chart_03_mechanical_reproduction`
- Corpus: `en` (English)
- Date range: 1800-2020
- Smoothing: 0
- Case-sensitive query: false
- Case-insensitive parameter: true
- Query batching: 8 terms per request, with single-term retry after batch failure

## Terms Attempted

### chart06_sense

- artificial light: early sensory substitute / illumination anchor
- artificial colour: British spelling; color and perception manufacturing
- artificial color: American spelling; color and perception manufacturing
- artificial flower: decorative substitute and artificial natural object
- artificial flavour: British spelling; food-sensory substitute and suspicion
- artificial flavor: American spelling; food-sensory substitute and suspicion
- artificial sweetener: taste substitute and consumer-regulatory signal

### chart06_material

- artificial silk: industrial textile substitute
- artificial stone: engineered building/material substitute
- artificial rubber: synthetic/wartime material substitute
- artificial fibre: British spelling; synthetic textile material
- artificial fiber: American spelling; synthetic textile material
- artificial resin: synthetic material and industrial polymer vocabulary

### chart06_biological

- artificial respiration: life-support intervention and artificial bodily process
- artificial limb: prosthetic body part
- artificial insemination: reproductive technology and postwar biological intervention
- artificial kidney: organ replacement / medical machine
- artificial heart: organ replacement frontier
- artificial organ: general organ-replacement phrase

### chart06_cognitive

- artificial language: constructed symbolic/cognitive system
- artificial memory: memory metaphor / cognitive prosthesis phrase
- artificial intelligence: machine cognition anchor
- artificial reasoning: machine/cognitive-process phrase
- artificial neural network: late cognitive/AI technical phrase

### chart06_social

- artificial manner: social conduct and performed style
- artificial behaviour: British spelling; social/moral artificiality
- artificial behavior: American spelling; social/moral artificiality
- artificial smile: performed emotion and authenticity pressure
- artificial dignity: moral/social performance phrase
- artificial excitement: performed affect and social artificiality

## Status

- Terms attempted: 30
- Successfully collected: 30
- Missing: 0
- Too sparse: 0
- Errored: 0







## Strongest Signals By Peak Frequency

- artificial intelligence (COGNITIVE): peak 7.802152498702364 per million
- artificial silk (MATERIAL): peak 4.645318360169126 per million
- artificial light (SENSE): peak 1.1942825789978961 per million
- artificial stone (MATERIAL): peak 1.1374043615286489 per million
- artificial insemination (BIOLOGICAL): peak 1.090718884655395 per million
- artificial respiration (BIOLOGICAL): peak 0.9017490214535684 per million
- artificial neural network (COGNITIVE): peak 0.7941732090115117 per million
- artificial limb (BIOLOGICAL): peak 0.5622288016815524 per million
- artificial kidney (BIOLOGICAL): peak 0.38543707137073113 per million
- artificial heart (BIOLOGICAL): peak 0.37310356270497946 per million
- artificial resin (MATERIAL): peak 0.2254921800393106 per million
- artificial memory (COGNITIVE): peak 0.18519766875613186 per million

## Output Files

- `raw/chart_06_ngram_raw_sense.csv`
- `raw/chart_06_ngram_raw_material.csv`
- `raw/chart_06_ngram_raw_biological.csv`
- `raw/chart_06_ngram_raw_cognitive.csv`
- `raw/chart_06_ngram_raw_social.csv`
- `processed/chart_06_compound_ngram_long.csv`
- `processed/chart_06_compound_term_metadata.csv`
- `processed/chart_06_compound_term_inventory.csv`

## Request URLs

- https://books.google.com/ngrams/json?content=artificial+light%2Cartificial+colour%2Cartificial+color%2Cartificial+flower%2Cartificial+flavour%2Cartificial+flavor%2Cartificial+sweetener&year_start=1800&year_end=2020&corpus=en&smoothing=0&case_insensitive=true
- https://books.google.com/ngrams/json?content=artificial+silk%2Cartificial+stone%2Cartificial+rubber%2Cartificial+fibre%2Cartificial+fiber%2Cartificial+resin&year_start=1800&year_end=2020&corpus=en&smoothing=0&case_insensitive=true
- https://books.google.com/ngrams/json?content=artificial+respiration%2Cartificial+limb%2Cartificial+insemination%2Cartificial+kidney%2Cartificial+heart%2Cartificial+organ&year_start=1800&year_end=2020&corpus=en&smoothing=0&case_insensitive=true
- https://books.google.com/ngrams/json?content=artificial+language%2Cartificial+memory%2Cartificial+intelligence%2Cartificial+reasoning%2Cartificial+neural+network&year_start=1800&year_end=2020&corpus=en&smoothing=0&case_insensitive=true
- https://books.google.com/ngrams/json?content=artificial+manner%2Cartificial+behaviour%2Cartificial+behavior%2Cartificial+smile%2Cartificial+dignity%2Cartificial+excitement&year_start=1800&year_end=2020&corpus=en&smoothing=0&case_insensitive=true

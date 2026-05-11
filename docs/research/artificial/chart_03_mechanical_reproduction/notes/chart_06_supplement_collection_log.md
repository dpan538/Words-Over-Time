# Chart 06 Supplement Collection Log

Generated: 2026-05-11T10:52:28.397Z

## Script

- `scripts/fetch_chart_06_compound_supplement.ts`

## Purpose

This pass tests whether the weak SOCIAL lane can be strengthened and whether the COGNITIVE lane should split into early artificial-prefix cognition and modern machine-cognition infrastructure.

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

### chart06_social_supplement

- artificial politeness: performed civility / social artificiality
- artificial courtesy: performed civility / etiquette artificiality
- artificial affectation: explicit performance and inauthentic style
- artificial sentiment: performed feeling and sincerity pressure
- artificial emotion: performed or simulated emotion
- artificial sympathy: performed moral feeling
- artificial cheerfulness: performed affect
- artificial gaiety: performed affect, nineteenth-century register
- artificial expression: performed expression and appearance
- artificial gesture: performed bodily expression
- artificial voice: performed voice / mediated voice bridge
- artificial personality: modern social/AI persona bridge

### chart06_cognitive_artificial

- artificial mind: strict artificial-prefix cognitive candidate
- artificial brain: strict artificial-prefix machine/body cognition candidate
- artificial thought: strict artificial-prefix cognition metaphor
- artificial reason: strict artificial-prefix reasoning metaphor
- artificial logic: strict artificial-prefix logic/formal reasoning candidate
- artificial consciousness: strict artificial-prefix consciousness candidate

### chart06_cognitive_infrastructure

- machine intelligence: non-artificial cognitive infrastructure comparator
- machine learning: modern cognitive/AI infrastructure
- neural network: modern cognitive/AI infrastructure
- expert system: symbolic AI infrastructure
- symbolic reasoning: symbolic AI/cognitive process infrastructure
- natural language processing: language AI infrastructure
- computer vision: perceptual AI infrastructure

## Status

- Terms attempted: 25
- Successfully collected: 25
- Missing: 0
- Too sparse: 0
- Errored: 0







## Strongest Signals By Peak Frequency

- machine learning (COGNITIVE): peak 10.673788817888719 per million
- neural network (COGNITIVE): peak 6.920761088657912 per million
- expert system (COGNITIVE): peak 5.620899405568702 per million
- computer vision (COGNITIVE): peak 2.8727645243753486 per million
- natural language processing (COGNITIVE): peak 1.045518455134592 per million
- machine intelligence (COGNITIVE): peak 0.4869922594907816 per million
- symbolic reasoning (COGNITIVE): peak 0.0642323260136024 per million
- artificial brain (COGNITIVE): peak 0.03119316471789091 per million
- artificial reason (COGNITIVE): peak 0.026214971526883346 per million
- artificial logic (COGNITIVE): peak 0.0213405240145903 per million
- artificial courtesy (SOCIAL): peak 0.020393796873463543 per million
- artificial politeness (SOCIAL): peak 0.019685504781818963 per million

## Output Files

- `raw/chart_06_ngram_raw_social_supplement.csv`
- `raw/chart_06_ngram_raw_cognitive_artificial_supplement.csv`
- `raw/chart_06_ngram_raw_cognitive_infrastructure.csv`
- `processed/chart_06_supplement_ngram_long.csv`
- `processed/chart_06_supplement_term_metadata.csv`
- `processed/chart_06_supplement_term_inventory.csv`

## Request URLs

- https://books.google.com/ngrams/json?content=artificial+politeness%2Cartificial+courtesy%2Cartificial+affectation%2Cartificial+sentiment%2Cartificial+emotion%2Cartificial+sympathy%2Cartificial+cheerfulness%2Cartificial+gaiety&year_start=1800&year_end=2020&corpus=en&smoothing=0&case_insensitive=true
- https://books.google.com/ngrams/json?content=artificial+expression%2Cartificial+gesture%2Cartificial+voice%2Cartificial+personality&year_start=1800&year_end=2020&corpus=en&smoothing=0&case_insensitive=true
- https://books.google.com/ngrams/json?content=artificial+mind%2Cartificial+brain%2Cartificial+thought%2Cartificial+reason%2Cartificial+logic%2Cartificial+consciousness&year_start=1800&year_end=2020&corpus=en&smoothing=0&case_insensitive=true
- https://books.google.com/ngrams/json?content=machine+intelligence%2Cmachine+learning%2Cneural+network%2Cexpert+system%2Csymbolic+reasoning%2Cnatural+language+processing%2Ccomputer+vision&year_start=1800&year_end=2020&corpus=en&smoothing=0&case_insensitive=true

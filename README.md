# Words Over Time

A semantic-change, word-frequency, and search-statistics research project by Dai Pan / 潘岱, presented as design research and infographic art.

Dai Pan is a Chinese artist, designer, and design researcher working across visual art, photography, printmaking, writing, and research-led visual systems.

## Routes

- `/` - typographic home page
- `/words` - public index of all word studies
- `/words/data` - data as evidence, storage, and social infrastructure
- `/words/privacy` - privacy as seclusion, legal right, and data-governance pressure
- `/words/artificial` - artificial from artifice to computation and machine reproduction
- `/words/hub` - hub as stable naming format and dependency field
- `/words/depression` - depression across economic, clinical, and atmospheric branches
- `/words/forever` - forever across duration, devotion, and platform memory
- `/about` - methodology, source ledger, citation style, and rights statement

## Discovery surfaces

- `/sitemap.xml` - canonical URL sitemap for search engines
- `/robots.txt` - crawler access policy and raw-data exclusions
- `/llms.txt` - concise AI retrieval entry point and public content boundary
- `/feed.xml` - RSS discovery feed for public routes
- `/opengraph-image` and `/twitter-image` - default social preview images
- `/words/[slug]/opengraph-image` and `/words/[slug]/twitter-image` - route-specific word study previews

## Local Development

```bash
npm install
npm run dev -- -p 9000
```

Then open `http://localhost:9000`.

## Data pipelines

The word pages use generated JSON committed under `src/data/generated` and curated records under `src/data`.

```bash
npm run data:forever:ngram      # Google Books Ngram frequency series
npm run data:forever:gutenberg  # Project Gutenberg seed texts, snippets, collocates
npm run data:forever:build      # derived phrase/category/network/inspector data
npm run data:forever            # full pipeline
```

Additional scripts in `package.json` build the data, depression, and artificial evidence layers. Frequency coverage, archival snippets, modern context anchors, dictionary checks, policy references, and generated labels are source-specific. Contextual evidence bands are curated heuristics, not automated universal sense classification.

## Rights and attribution

The repository is public for inspection, reproducibility, citation, and method review.

Project source code is released under the MIT License. Research writing, methodology narrative, infographic and interface design, page composition, curated datasets, word lists, semantic groupings, editorial classifications, and the Dai Pan / 潘岱 authorship mark are not released under MIT.

Non-code research and design materials may be cited, studied, and referenced for non-commercial research or educational purposes with clear attribution to Dai Pan / 潘岱 and Words Over Time. Commercial copying, resale, republication, product packaging, dataset extraction, or visual/design reproduction is not permitted without written permission.

Third-party data, source records, snippets, APIs, dictionary references, public-domain texts, Creative Commons materials, and publisher pages remain governed by their original source terms. Do not republish full third-party articles, full books, full dictionary entries, subscription-only material, or restricted corpus exports from this repository.

Raw source caches and large research intermediates are intentionally ignored through `.gitignore` patterns such as `docs/research/**/raw/` and `docs/research/**/cache/`. Before making the repository public, confirm those paths are not committed or deployed.

See `LICENSE.md`, `LICENSE-CODE.md`, `NOTICE.md`, and `/about` for the publication rules, citation style, and rights notes.

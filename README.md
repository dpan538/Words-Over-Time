# Words Over Time

A bold editorial prototype for curated historical word-frequency visualization.

## Routes

- `/` - typographic home page
- `/words/forever` - demo detail page for "forever"
- `/about` - about and methodology

## Local Development

```bash
npm install
npm run dev -- -p 9000
```

Then open `http://localhost:9000`.

## Forever Data Pipeline

The `/words/forever` route uses generated JSON committed under `src/data/generated`.

```bash
npm run data:forever:ngram      # Google Books Ngram frequency series
npm run data:forever:gutenberg  # Project Gutenberg seed texts, snippets, collocates
npm run data:forever:build      # derived phrase/category/network/inspector data
npm run data:forever            # full pipeline
```

Frequency coverage currently comes from Google Books Ngram for 1700-2022.
Snippet, phrase, and collocate evidence comes from a small Project Gutenberg
public-domain seed covering 1726-1930. Contextual evidence bands are curated
heuristics, not automated sense classification.

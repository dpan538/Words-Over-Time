# Search Console indexing plan

Date reviewed: 2026-06-09.

## Current Search Console signal

The screenshots show early-stage indexing rather than a serious penalty:

- 3 total web search clicks.
- 23 impressions.
- 8 indexed pages.
- 11 not indexed pages.
- Homepage has 3 clicks and 3 impressions.
- `/words/hub` has 9 impressions.
- `/words/privacy` has 4 impressions.
- `/words/forever` has 3 impressions.
- `/words/artificial` has 1 impression.
- Queries include `how long is forever meaning`, `diagram hub`, and `privacy definition over years`.
- Countries include Australia with clicks and United States with impressions.

The main issue is not that Google cannot find the site. The main issue is signal consolidation and promotion readiness.

## Immediate technical findings

The site already has:

- `sitemap.xml`
- `robots.txt`
- canonical metadata
- Open Graph and Twitter metadata
- route-level JSON-LD
- `/llms.txt`
- RSS feed

Live header checks show:

- `https://www.wordsovertime.com/` returns `200`.
- `https://wordsovertime.com/` redirects to `https://www.wordsovertime.com/` with `307`.
- `http://www.wordsovertime.com/` redirects to `https://www.wordsovertime.com/` with `308`.
- `http://wordsovertime.com/` redirects first to `https://wordsovertime.com/` with `308`, then to `https://www.wordsovertime.com/`.

The Search Console page list also shows `http://wordsovertime.com/`, so canonical and redirect consolidation should be tightened.

## Changes made in code

- Default canonical host changed to `https://www.wordsovertime.com`.
- `siteConfig.updatedAt` updated to `2026-06-09` so sitemap and feeds reflect the current review.
- Added a Next.js host redirect rule from `wordsovertime.com` to `https://www.wordsovertime.com/:path*`.

Vercel may still apply domain-level redirects before the app sees a request. Confirm in Vercel that `www.wordsovertime.com` is the primary domain and that the bare domain redirects permanently to it.

## Page size and crawl/rendering concern

Live `content-length` checks:

- `/words`: about 40 KB.
- `/about`: about 167 KB.
- `/words/artificial`: about 155 KB.
- `/words/data`: about 412 KB.
- `/words/hub`: about 425 KB.
- `/words/forever`: about 1.6 MB.
- `/words/depression`: about 1.9 MB.
- `/words/privacy`: about 3.0 MB.

Google can index large pages, but the heavier pages may reduce crawl efficiency, mobile performance, and sharing performance. The priority optimization is to keep the index pages light and make heavy word pages easier to discover and summarize.

## Recommended Search Console actions

1. Submit or resubmit `https://www.wordsovertime.com/sitemap.xml`.
2. Inspect these canonical URLs and request indexing:
   - `https://www.wordsovertime.com/`
   - `https://www.wordsovertime.com/words`
   - `https://www.wordsovertime.com/about`
   - `https://www.wordsovertime.com/words/hub`
   - `https://www.wordsovertime.com/words/privacy`
   - `https://www.wordsovertime.com/words/forever`
   - `https://www.wordsovertime.com/words/artificial`
   - `https://www.wordsovertime.com/words/data`
3. In the Pages report, check whether the 11 not-indexed URLs are mostly duplicates, image routes, feed/robots routes, or alternate `http`/bare-domain variants.
4. If `http://wordsovertime.com/` remains visible after redeploy, check Vercel domain settings and mark `www.wordsovertime.com` as primary.

## Promotion-ready adaptations

Highest priority:

- Keep `/` and `/words` as the light discovery surfaces.
- Add clear internal links from the homepage to every complete word page.
- Make each word card include a compact plain-language search phrase such as `privacy definition over years`, `hub meaning over time`, or `forever meaning history`.
- Use the article/research framing on `/about` and `/words` so Google sees the site as design research and public humanities, not only abstract visual art.

Medium priority:

- Split very heavy pages into lighter chapter routes or lazy-loaded sections after the current article work stabilizes.
- Create concise static summary sections near the top of heavy pages before interactive charts.
- Consider adding FAQ-style plain text blocks on word pages for the exact query shapes appearing in Search Console.

Do not:

- Stuff keywords.
- Remove source-boundary language to chase traffic.
- Let frequency pages read like dictionary pages if the claim is more careful than that.

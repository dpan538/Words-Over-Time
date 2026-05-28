# SEO and promotion launch checklist

This checklist is for the post-deploy pass after the production domain is final. It is intentionally kept under `docs/launch`, which is excluded by `.vercelignore`; it is for repository operators, not public deployment.

## Canonical deploy checks

- Confirm the production canonical host in Vercel: `NEXT_PUBLIC_SITE_URL=https://www.wordsovertime.com` or the final preferred domain.
- Redeploy after changing `NEXT_PUBLIC_SITE_URL`.
- Open and verify these public endpoints return `200`:
  - `/`
  - `/words`
  - `/words/forever`
  - `/words/artificial`
  - `/words/privacy`
  - `/words/hub`
  - `/words/depression`
  - `/words/data`
  - `/about`
  - `/sitemap.xml`
  - `/robots.txt`
  - `/feed.xml`
  - `/llms.txt`
  - `/manifest.webmanifest`
  - `/opengraph-image`
  - `/twitter-image`
- Verify at least one route-specific image, for example `/words/privacy/opengraph-image`.
- Inspect rendered page source for canonical URLs, Open Graph tags, Twitter tags, JSON-LD, and RSS alternate metadata.

## Search Console

- Add or confirm the production domain property in Google Search Console.
- Submit `https://www.wordsovertime.com/sitemap.xml` in the Sitemaps report.
- Google also accepts RSS/Atom as sitemap formats, so submit `https://www.wordsovertime.com/feed.xml` only if a second discovery surface is useful.
- Use URL Inspection for the homepage, `/words`, `/about`, and all public word routes.
- Use the live test when a sitemap or page reports `Couldn't fetch`; confirm robots access and HTTP status first.

Reference: Google Search Console Sitemaps report notes that submitted sitemaps are crawled after submission, status is tracked in the report, and RSS is an accepted sitemap type.

## Bing Webmaster Tools and IndexNow

- Add the site in Bing Webmaster Tools or import it from Google Search Console.
- Submit `https://www.wordsovertime.com/sitemap.xml`.
- Submit the key public URLs through Bing's URL Submission tool after the first production deploy.
- Optional later step: enable IndexNow only after the final domain is stable. Generate a key, host the UTF-8 key file on the same host, submit changed URLs, then verify receipt in Bing Webmaster Tools.
- Do not add an IndexNow key file until the canonical domain choice is final.

Reference: Bing documents sitemap submission in Webmaster Tools and describes IndexNow as a four-step flow: generate key, host key, submit URLs, verify receipt.

## Social preview QA

- Test homepage and each word route with LinkedIn Post Inspector.
- Test homepage and each word route with Facebook Sharing Debugger.
- Test X/Twitter card previews where available; otherwise share to a private draft/post composer and confirm the large image.
- Paste URLs into Slack, Discord, iMessage, and one email client to confirm title, description, image, and canonical URL.
- If a platform caches stale data, force a scrape/refresh in the platform debugger.

## Promotion surfaces

- GitHub repository: keep `README.md`, `NOTICE.md`, and `/about` aligned on source boundaries and rights.
- Vercel project: set project description to "Historical word-change visual essays with public corpus signals and explicit source boundaries."
- Short launch copy: "Words Over Time is a visual archive of how words change across culture, technology, law, medicine, and public discourse."
- Suggested initial communities: digital humanities, information design, historical linguistics, creative coding, AI/data governance, and design research.
- Share individual routes rather than only the homepage when posting topic-specific updates.

## Ongoing cadence

- Recheck Search Console and Bing Webmaster Tools seven days after launch.
- Refresh the sitemap and feed automatically through source control whenever a word route is added.
- Add a short changelog entry to the README after major public content updates.
- Keep raw caches, API responses, OCR runs, and third-party full-text material outside Vercel deployment and outside public promotion assets.

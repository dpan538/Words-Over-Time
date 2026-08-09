# Canonical and indexing audit

Status: **BLOCKED_WITH_EVIDENCE** for live-production verification

Audit target: `https://www.wordsovertime.com/`

Collection window: `2026-08-08T07:36:39Z` / `2026-08-08T17:36:40+10:00` (Australia/Brisbane)
Prepared: 2026-08-09 (Australia/Brisbane)

## Result in one sentence

The execution sandbox could not resolve `www.wordsovertime.com`, so this audit obtained no production HTTP headers or HTML and therefore makes **no claim** about production redirects, status codes, canonical consistency, raw HTML, structured data, sitemap, robots, feed, or `llms.txt`. Every unobserved field below is recorded as `null / not verified`, rather than inferred from repository code or expected Next.js behavior.

This is a measurement limitation, not evidence of an outage or an indexing defect.

## Evidence and reproducibility

Environment recorded before the production request:

```text
Working directory: /Users/jarlgiovanni/Desktop/words_overtime
curl: /usr/bin/curl
curl version: 8.7.1 (x86_64-apple-darwin25.0)
TLS/backend line: SecureTransport; LibreSSL/3.3.6; nghttp2/1.68.1
UTC: 2026-08-08T07:36:39Z
Australia/Brisbane: 2026-08-08T17:36:40+1000
```

Exact attempted live command:

```sh
curl -sS -I --max-time 20 https://www.wordsovertime.com/
```

Exact observed result:

```text
curl: (6) Could not resolve host: www.wordsovertime.com
exit_code=6
wall_time_seconds=2.952952709
HTTP status=null
redirect hops=null
```

An escalation request for the same read-only request was initiated but interrupted before any response was returned. It yielded no usable headers, body, status, redirect history, or timing data. Per the audit instruction, it was not retried indefinitely.

No production response body was obtained. No browser or search-cache rendering is substituted for raw server HTML. The final local production-build results below are reported separately and are not presented as evidence of what the public host served.

### Secondary public-index retrieval (not an HTTP-header test)

On 2026-08-09, a separate web index/open provider returned previously crawled representations for the public Home page (labelled “crawled last month”) and Forever page (labelled “crawled 6 days ago”). The retrieved Forever text still contained the pre-branch wider-screen refusal, and the retrieved Home navigation did not expose the new `/words` link. This is evidence that the provider's indexed snapshot predates this branch; it is **not** proof of the live response at collection time or of current deployment parity. The same provider refused direct robots, sitemap, and non-www test URLs as unsafe, so it supplied no status, redirect, header, or discovery-endpoint evidence. The production matrices therefore remain `null / not verified`.

## Final local production build validation (separate from live production)

The final local production build passed its canonical/raw-HTML validation. This establishes what the audited build emits under the local production server; it does **not** establish deployment parity, public HTTP status, www/non-www redirects, query preservation, trailing-slash behavior, CDN behavior, or the contents currently served by `wordsovertime.com`.

### Build identity and command result

```text
Source HEAD: 4d777597487062c23c9a75f65470ac6e7760abe1
Next.js build ID: EO9j2G4AzAu8Xfjy287UM
Validation command: npm run verify
Validation exit code: 0
```

The full source revision was independently resolved with:

```sh
git rev-parse 4d77759
```

Result:

```text
4d777597487062c23c9a75f65470ac6e7760abe1
```

### Local canonical route results

The local static/raw checks covered exactly the nine intended canonical public routes. `Pass` below means the checked field was present/valid in the final local production build; it does not substitute for a live-domain observation. Exact metadata strings are not reconstructed here because the validation result supplied field-level pass/fail evidence rather than a metadata-value export.

| Route | Raw title | Raw description | Canonical | `og:url` | Exactly 1 H1 | JSON-LD parses | Server-rendered direct answer | Principal validated JSON-LD types |
|---|---|---|---|---|---|---|---|---|
| `/` | Pass | Pass | Pass | Pass | Pass | Pass | N/A | `WebSite` and route-appropriate root entities |
| `/words` | Pass | Pass | Pass | Pass | Pass | Pass | N/A | `CollectionPage`, `BreadcrumbList` |
| `/about` | Pass | Pass | Pass | Pass | Pass | Pass | N/A | `AboutPage`, `BreadcrumbList` |
| `/words/forever` | Pass | Pass | Pass | Pass | Pass | Pass | Pass | `WebPage`, `ImageObject`, `BreadcrumbList`, `DefinedTerm`, `Article`, `Dataset` |
| `/words/privacy` | Pass | Pass | Pass | Pass | Pass | Pass | Pass | `WebPage`, `ImageObject`, `BreadcrumbList`, `DefinedTerm`, `Article`, `Dataset` |
| `/words/artificial` | Pass | Pass | Pass | Pass | Pass | Pass | Pass | `WebPage`, `ImageObject`, `BreadcrumbList`, `DefinedTerm`, `Article`, `Dataset` |
| `/words/hub` | Pass | Pass | Pass | Pass | Pass | Pass | Pass | `WebPage`, `ImageObject`, `BreadcrumbList`, `DefinedTerm`, `Article`, `Dataset` |
| `/words/depression` | Pass | Pass | Pass | Pass | Pass | Pass | Pass | `WebPage`, `ImageObject`, `BreadcrumbList`, `DefinedTerm`, `Article`, `Dataset` |
| `/words/data` | Pass | Pass | Pass | Pass | Pass | Pass | Pass | `WebPage`, `ImageObject`, `BreadcrumbList`, `DefinedTerm`, `Article`, `Dataset` |

Additional final-build results:

- `/sitemap.xml` parsed and contained exactly the nine canonical URLs above, with route image entries and `lastModified` set to `2026-07-28`.
- `/robots.txt` allowed public routes and retained exclusions for documentation/raw/cache or otherwise restricted paths; no accidental broad public disallow was found locally.
- The local feed and `llms.txt` stayed within the same canonical/publication boundary.
- A deliberately unknown local path returned a genuine 404.
- All six canonical word pages exposed their direct answer in server-rendered raw HTML.

### Deliberate structured-data boundary

The final local build did not add `identifier`, `version`, `temporalCoverage`, `isBasedOn`, `sameAs`, `variableMeasured`, or `distribution` merely to increase Dataset property count. Route-specific factual modelling and/or distribution-rights evidence was insufficient to add those properties confidently. In particular, the project DOI was not duplicated as a separate dataset identifier on every word route, and no downloadable distribution was exposed without a defensible rights basis.

### Release-scope risk: untracked demo route

The build route list also showed the user-owned, untracked route `/words/privacy/mobile-demo`. It was correctly absent from the nine-URL sitemap, but its appearance in a production build is a release-scope risk: if the untracked route is included in a deployment, it may become directly addressable despite not being an intended canonical/sitemap route. This audit did not modify, delete, stage, or classify that user change. Confirm whether the route is intentionally publishable before deployment.

The local production build therefore supports confidence in the emitted canonical markup and server-rendered answers for the nine intended routes. It does not change the live-production matrix below: public status codes, redirect hops, and public-host content remain `null / not verified` because the live request produced no response.

## Production route matrix

Legend: `null` means no production response was obtained. `Not verified` means no conclusion is possible from the collected evidence.

| Route | HTTP status | Redirect hops | `<title>` | Meta description | H1 count/text | Crawlable primary anchors | Canonical | Open Graph URL/title/image | JSON-LD parse/types | Result |
|---|---:|---:|---|---|---|---|---|---|---|---|
| `/` | null | null | null | null | null | null | null | null | null | Not verified |
| `/words` | null | null | null | null | null | null | null | null | null | Not verified |
| `/about` | null | null | null | null | null | null | null | null | null | Not verified |
| `/words/forever` | null | null | null | null | null | null | null | null | null | Not verified |
| `/words/privacy` | null | null | null | null | null | null | null | null | null | Not verified |
| `/words/artificial` | null | null | null | null | null | null | null | null | null | Not verified |
| `/words/hub` | null | null | null | null | null | null | null | null | null | Not verified |
| `/words/depression` | null | null | null | null | null | null | null | null | null | Not verified |
| `/words/data` | null | null | null | null | null | null | null | null | null | Not verified |

The following raw-HTML requirements are consequently not verified for any route:

- title and description in the server response;
- exactly one clear H1;
- primary answer content present without interaction;
- critical internal links represented as crawlable anchors;
- primary content independent of click, swipe, or client hydration;
- canonical and Open Graph URL agreement;
- parseable JSON-LD and factual modelling of `DefinedTerm`, `Article`, `Dataset`, `BreadcrumbList`, `WebSite`, or `Person`.

## Host, redirect, and status matrix

| Test | Required assertion | Observed final status | Observed `Location` | Hops | Verdict |
|---|---|---:|---|---:|---|
| `http://wordsovertime.com/` | Permanent, one-hop redirect to `https://www.wordsovertime.com/` | null | null | null | Not verified |
| `https://wordsovertime.com/` | Permanent, one-hop redirect to `https://www.wordsovertime.com/` | null | null | null | Not verified |
| Non-www route path | Preserve the exact public path | null | null | null | Not verified |
| Non-www path plus query | Preserve path and query parameters | null | null | null | Not verified |
| `http://www.wordsovertime.com/` | Permanent, one-hop HTTPS redirect | null | null | null | Not verified |
| Canonical public URL | Return 200 without a redirect chain | null | null | null | Not verified |
| Trailing-slash variant | Resolve consistently without a loop or avoidable chain | null | null | null | Not verified |
| Nonexistent route | Return a genuine 404 response, not a soft 404 | null | null | null | Not verified |

This evidence cannot establish whether non-www redirects are permanent, one hop, path preserving, query preserving, loop free, or chain free. It also cannot establish production trailing-slash behavior or genuine 404 handling.

## Canonical consistency matrix

No production values were observed, so none of these surfaces can be compared:

| Surface | Production value | Verification |
|---|---|---|
| HTML canonical | null | Not verified |
| Sitemap page URL | null | Not verified |
| Open Graph `og:url` | null | Not verified |
| JSON-LD entity/page URL | null | Not verified |
| RSS/feed page links | null | Not verified |
| Internal anchors | null | Not verified |
| Social-image URLs | null | Not verified |

In particular, repository configuration, route metadata, or a successful local build would only describe intended output. They would not prove what the production domain served during this collection window.

## Discovery endpoints

| Endpoint | HTTP status | Content-Type | Parse result | Canonical-only/public-only checks | Verdict |
|---|---:|---|---|---|---|
| `/sitemap.xml` | null | null | null | URL set, `lastModified`, image URLs, restricted-path exclusion not checked | Not verified |
| `/robots.txt` | null | null | null | Public crawlability, restricted-path exclusions, broad-disallow risk not checked | Not verified |
| `/feed.xml` | null | null | null | Link host/canonical agreement not checked | Not verified |
| `/rss.xml` | null | null | null | Alternate feed location not checked | Not verified |
| `/llms.txt` | null | null | null | Public content and canonical links not checked | Not verified |

No assertion is made that any particular feed pathname exists. Both likely feed endpoints are listed as test cases so a network-capable rerun can discover the actual route without converting an assumption into a finding.

## Structured-data validation status

| Type | JSON parse | Required-property review | URL consistency | Status |
|---|---|---|---|---|
| `DefinedTerm` | null | null | null | Not verified |
| `Article` | null | null | null | Not verified |
| `Dataset` | null | null | null | Not verified |
| `BreadcrumbList` | null | null | null | Not verified |
| `WebSite` | null | null | null | Not verified |
| `Person` | null | null | null | Not verified |

Dataset fields such as `identifier`, `version`, `temporalCoverage`, `isBasedOn`, `sameAs`, `variableMeasured`, and `distribution` were not observed in production. In the final local build, they were deliberately not added because the route-specific factual model and/or rights evidence was insufficient. This audit does not recommend attaching the project DOI to each route, does not infer downloadable distributions, and does not infer publication rights.

## Findings and priority

### P0

No production P0 defect was verified. The P0 **verification gap** is that host consolidation, query preservation, public-route 200 responses, and genuine 404 behavior remain unknown because no HTTP response was available. This should block any claim that production canonical/indexing behavior has been validated, but it should not be reported as a production failure.

### P1

Run the matrix below from a network-capable environment and retain the full headers and HTML. This is necessary to validate intended configuration after deployment:

1. Test HTTP/HTTPS and www/non-www variants with `curl --max-redirs 0` and `curl -L`, recording every status and `Location`.
2. Include a non-www route with a benign query string (for example, `/words/forever?audit=canonical`) and verify exact path/query preservation in one hop.
3. Test slash/no-slash forms for every public route and a deliberately nonexistent path.
4. Download raw HTML for every route and parse title, description, H1 count, anchor `href`s, canonical, Open Graph tags, and every `application/ld+json` block.
5. Fetch and parse sitemap, robots, the discovered feed URL, and `llms.txt`; compare every emitted page URL across surfaces.
6. Before deployment, explicitly decide whether the untracked `/words/privacy/mobile-demo` route belongs in release scope; its current omission from the canonical sitemap is correct for an unintended/demo surface, but the route should not be accidentally shipped.

Suggested reproducible command forms for the rerun (not executed in this collection):

```sh
curl -sS -o /dev/null -D - --max-redirs 0 'https://wordsovertime.com/words/forever?audit=canonical'
curl -sS -L -o /dev/null -D - --max-redirs 10 'https://wordsovertime.com/words/forever?audit=canonical'
curl -sS -D - 'https://www.wordsovertime.com/words/forever'
curl -sS -D - 'https://www.wordsovertime.com/this-route-must-not-exist-audit-20260808'
curl -sS 'https://www.wordsovertime.com/sitemap.xml'
curl -sS 'https://www.wordsovertime.com/robots.txt'
curl -sS 'https://www.wordsovertime.com/llms.txt'
```

## Release annotation and measurement boundary

The project-provided annotation identifies **2026-07-28**, “optimize search discovery and crawl payloads,” as the latest major search-related release. It is retained as an analysis annotation only. This live audit did not verify deployment contents or deployment time, so it does not claim that the production responses reflect that commit.

Likewise, the unavailable average-position field in the supplied GSC screenshots must remain unknown. No conclusion about ranking, CTR at a competitive position, query-intent mismatch, first-screen quality, mobile usability, or performance can be derived from this failed HTTP request alone.

## Completion boundary

- Production requests with usable responses: **0**
- Production routes whose HTTP status was verified: **0 of 9**
- Redirect chains verified: **0**
- Raw HTML documents inspected: **0**
- Discovery endpoints parsed: **0**
- JSON-LD documents parsed: **0**
- Final local production build identity: **`EO9j2G4AzAu8Xfjy287UM`** at source HEAD **`4d777597487062c23c9a75f65470ac6e7760abe1`**
- Final local `npm run verify`: **exit 0**
- Local canonical routes with title/description/canonical/`og:url`/one-H1/JSON-LD pass: **9 of 9**
- Local word routes with a server-rendered direct answer: **6 of 6**
- Local sitemap canonical URL count: **9**
- Local unknown-path behavior: **genuine 404**
- Files modified by this sub-audit: `docs/audit/canonical-and-indexing-audit.md` only

Final live-production status: **BLOCKED_WITH_EVIDENCE**. The exact live blocker is sandbox DNS resolution (`curl` exit 6), followed by an interrupted escalation that returned no response. The final local production build validation passed, but a network-capable public-host check remains required.

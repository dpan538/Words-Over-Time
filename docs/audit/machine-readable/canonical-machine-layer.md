# Canonical machine layer audit

Status: implementation review checkpoint, 2026-08-23. This document records non-visible publication metadata decisions; it is not public route content and does not change either research edition.

## Scope and authority

The canonical machine layer describes one public research object per canonical route. It does not describe mobile or desktop layout, chart order, interaction, or edition-specific findings. The canonical origin is fixed to `https://www.wordsovertime.com`; it does not depend on a public environment variable.

The existing client-reachable registry in `src/lib/site.ts` remains frozen because visible Home/Words components and desktop summaries consume its route objects. The server-only contract therefore lives in:

- `src/lib/machine/canonical-publication-data.ts`: typed values, guarded by `server-only`;
- `src/lib/machine/canonical-publication.ts`: metadata and JSON-LD assembly, also guarded by `server-only`.

The dependency-free machine audit uses a Node built-in resolve hook to substitute the framework's `server-only` sentinel while reading the typed data module. It also walks the source import graph and fails if either contract module is reachable from a `use client` root or if the data module has any source importer other than the guarded contract entry.

## Existing system inventory

| Surface | Existing implementation | Resolution |
| --- | --- | --- |
| Page metadata | `src/lib/site.ts`, imported by nine canonical pages | Nine page files change only the metadata/JSON-LD module specifier; page JSX is unchanged. |
| JSON-LD renderer | `src/components/JsonLd.tsx` | Frozen. One initial-HTML script remains on every canonical page. |
| Root metadata | `src/app/layout.tsx` | Frozen. Child metadata explicitly clears inherited `keywords`. |
| Robots | `src/app/robots.ts` | Existing route refined; no second policy route. |
| Sitemap | `src/app/sitemap.ts` | Existing route reads the canonical contract. |
| RSS | `src/app/feed.xml/route.ts` | Existing feed reads and sorts the canonical contract. |
| LLM index | `src/app/llms.txt/route.ts` | Existing route reads the canonical contract; no `ai.txt` or `llms-full.txt`. |
| Manifest | `src/app/manifest.ts` | Frozen because its description and colors are installed-app presentation. |
| OG/Twitter images | Existing file-based image routes and `src/lib/og-image.tsx` | Frozen. Metadata continues to reference those existing image URLs. |
| Host redirect | `next.config.ts` | Frozen. |

## Canonical route and date matrix

Dates follow meaningful public wording/research changes, not this machine-layer correction. Git establishes repository history, not independently verified first deployment time.

| Route | Machine title | Published | Last meaningful modification | Evidence commit |
| --- | --- | --- | --- | --- |
| `/` | Words Over Time: Semantic Change and Word Frequency | 2026-05-07 | 2026-08-11 | `6a4f1f9888021be049678de27e4403e3c29ef57d` / `04561dddad2e532e79f8e202cd35bf8d0357a667` |
| `/about` | Methodology, Sources, and Rights | 2026-05-07 | 2026-08-22 | `6a4f1f9888021be049678de27e4403e3c29ef57d` / `ed8aede26efdf40063958ae6bc813e853afac8c5` |
| `/words` | Word Studies: Meaning and Usage Over Time | 2026-05-28 | 2026-05-28 | `195bc2f5b700233ec137a3ba08ed4340b452ec56` |
| `/words/forever` | Forever and For Ever in Printed-Book Usage | 2026-05-07 | 2026-08-22 | `6a4f1f9888021be049678de27e4403e3c29ef57d` / `0a1075db04bf808789fc2d738b2430d110b03c9e` |
| `/words/artificial` | Artificial Meaning Over Time | 2026-05-10 | 2026-08-16 | `2ae15b1907a8612c7140bdbd87276dcda9d0f533` / `7543ab2111199cb77985a13f5155d92a9c329a58` |
| `/words/privacy` | Privacy: Public Attention and Institutional Systems | 2026-05-27 | 2026-08-13 | `2ebc1dc95059649babd0570da14076e84934d530` / `717957fce15410dc36c7a81ecb070919251d0dff` |
| `/words/hub` | Hub Meaning Over Time: Wheel to Network | 2026-05-13 | 2026-08-18 | `94cd70c538ce9e4eb71205b24cc83c5c063ce847` / `4424d9d825cf3fb9229b70e4cf260020ada8e7cf` |
| `/words/depression` | Depression Meanings Across Weather, Economy, and Clinical Use | 2026-05-08 | 2026-08-16 | `74f724a5e5f0afe100ceb133e41ce9b51b5fe74f` / `974a613102aafa2e98375693fdf013ce3c1cc8fe` |
| `/words/data` | Data Meaning Over Time: From Given to Governed | 2026-05-10 | 2026-08-20 | `7e32cb5ee47c8abb9491d963970e1ceb0f362499` / `d334e352221f5f7539f5fca2914d84d5996be168` |

The project `modifiedAt` and RSS `lastBuildDate` are the maximum route value, `2026-08-22`. Presentation-only, architecture-only, Safari-only, and this machine-only change do not advance content freshness.

## Shared-claim eligibility

Every public machine claim is supported by visible material in both editions. The full evidence matrix is retained outside the repository in the task audit directory.

| Contract claim | Mobile visible source | Desktop visible source | Canonical scope |
| --- | --- | --- | --- |
| Project identity | `src/components/home/mobile/MobileHome.tsx` | `src/components/home/desktop/DesktopHome.tsx` | semantic-frequency research project, design research, infographic art, authorship |
| Six public studies | `src/components/words/mobile/MobileWordsIndex.tsx` | `src/components/words/desktop/DesktopWordsIndex.tsx` | the six published route identities only |
| Method, provenance, limits, citation, rights | `src/components/about/mobile/MobileAbout.tsx` | `src/components/about/desktop/DesktopAbout.tsx` | public methodology and rights boundary |
| Forever / for ever | `src/components/forever/mobile/MobileForeverStudy.tsx` | `src/components/ForeverPoster.tsx` | exact written-form comparison in printed-book frequency evidence |
| Artificial branches | `src/components/artificial/mobile/MobileArtificialStudy.tsx` | `src/components/ArtificialPoster.tsx` | distinct making, simulated/synthetic, distrust, bodily-support, and modeled-process branches |
| Privacy attention and institutions | `src/components/privacy/mobile/MobilePrivacyStudy.tsx` | `src/components/PrivacyPoster.tsx` | selected attention plus policy/control/right/duty/risk evidence |
| Hub center migration | `src/components/hub/mobile/MobileHubStudy.tsx` | `src/components/HubPoster.tsx` | center concept across wheel, place, route, institution, network, service |
| Depression branches | `src/components/depression/mobile/DepressionStoryDeck.tsx` | `src/components/DepressionPoster.tsx` | one spelling across loweredness, melancholy, weather, economy, and clinical use |
| Data from given to governed | `src/components/data/mobile/MobileDataStudy.tsx` | `src/components/DataPoster.tsx` | given/countable material becoming collected, divided, packaged, governed, worked, and usable |

No canonical summary imports an edition-only conclusion, search-intent query list, raw note, generated-data-only claim, or hidden support text.

## Metadata contract

Each of the nine production HTML documents must contain exactly one title, description, canonical, robots directive, `og:url`, `og:title`, `og:description`, and Twitter card declaration. Canonicals are absolute HTTPS `www` URLs and identical across viewports and user agents. `keywords: null` is deliberate: it clears the root layout's inherited `<meta name="keywords">` without deleting the frozen research taxonomy used by visible components.

Metadata contains no user-agent, viewport, cookie, query, or hydration branch. The title, description, canonical, robots, and social metadata are present in initial server HTML.

## JSON-LD decisions

The graph is intentionally small:

| Route family | Top-level graph types |
| --- | --- |
| Home | `WebSite`, `Person`, `CollectionPage`, project-level `CreativeWork` |
| Words index | `WebSite`, `Person`, `CollectionPage`, `BreadcrumbList`, `ItemList` |
| About | `WebSite`, `Person`, `AboutPage`, `BreadcrumbList`, project-level `CreativeWork` |
| Word study | `WebSite`, `Person`, `WebPage`, `BreadcrumbList`, `DefinedTerm`, `Article` |

Route-level `Dataset` nodes and `Article.hasPart -> Dataset` were removed. There is no public dataset landing page, distribution, or download contract; internal raw/cache/generated files are not modeled as `DataDownload`. The project DOI appears only on the project `CreativeWork`, not as six route-level dataset identifiers.

`DefinedTerm` descriptions are explicitly research-scoped (`This study...`) rather than universal dictionary definitions. `Artificial` does not use `artifice` as an alternate name. `Person` retains the publicly supported name, native-name alternate, primary URL, `sameAs`, job title, and nationality.

Every graph is audited for JSON parsing, unique definition IDs, no reference-only dangling IDs, absolute URLs, canonical identity, valid non-future dates, no duplicate anonymous page entities, no unsupported schema family, and no private/local path.

## Robots policy

`OAI-SearchBot` and `ChatGPT-User` explicitly retain public access. `GPTBot`, `Google-Extended`, and `CCBot` retain the same public allow posture as the baseline; they are split into a named group only so the unchanged training-crawler policy is auditable. Claude/Perplexity/Applebot entries retain their existing public posture.

All groups share explicit non-public research disallows, including `/docs/`, `/docs/research/`, `/raw/`, `/cache/`, and cache-family patterns. These rules describe crawl boundaries; they are not authorization controls and do not create crawler-specific body variants.

## Sitemap, RSS, and llms.txt

- Sitemap route set: exactly the nine canonical routes in stable contract order, once each, with the audited `modifiedAt` and existing crawlable social-image URL. It excludes the mobile demo redirect, 404, query variants, internal APIs, raw, and cache paths.
- RSS route set: the same nine routes, stable canonical GUIDs, contract descriptions, XML escaping, and update order `/about`, `/words/forever`, `/words/data`, `/words/hub`, `/words/artificial`, `/words/depression`, `/words/privacy`, `/`, `/words`.
- `llms.txt`: the same nine-route inventory plus RSS, sitemap, robots, project DOI, public-content boundary, dual-edition interpretation, summarize/link permission, and third-party excerpt restriction. It contains neither search-intent dumps nor internal implementation paths.

## Page-file exception

The exception applies only to:

`src/app/page.tsx`, `src/app/about/page.tsx`, `src/app/words/page.tsx`, and the six canonical `src/app/words/<slug>/page.tsx` files.

Each file changes one metadata/JSON-LD import module specifier. A TypeScript AST projection confirms identical component JSX, mobile imports, edition-bridge imports, props, and render order before and after. No route assembly or presentation behavior changes.

## Validation boundary

The machine audit is dependency-free and reads production build artifacts. Browser and HTTP comparison separately establish user-agent parity, viewport parity, body/presentation identity, client-asset identity, and screenshots. The known Forever generated-artifact validator failure must be classified against untouched current main; it must not be regenerated or suppressed.

This work can establish technical machine readability, unchanged presentation, and crawler policy. It cannot establish ranking improvement, reindexing, rich-result eligibility, or future AI citation behavior.

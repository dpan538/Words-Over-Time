# Route inventory: search, rendering, and mobile behavior

Audit snapshot: 2026-08-08 (Australia/Brisbane)  
Source branch: `audit/mobile-search-growth-2026-08`  
Source HEAD: `e9ee61e57294bb99fc4594a1b53b75935a244b53` (`optimize search discovery and crawl payloads`)  
Runtime observed: Node `v22.21.0`; npm `10.9.4`

This is a code-led, read-only route inventory for the nine requested public routes. It does not infer ranking, average position, Core Web Vitals, or production transfer size. The only file created by this inventory task is this document.

Unrelated working-tree state was preserved: the deleted `docs/research/privacy/processed/privacy_geo_spatial_metrics_processed.json`, the untracked `src/app/words/privacy/mobile-demo/`, and the untracked `src/components/privacy/PrivacyMobileExperience.tsx` were not changed.

## Method and limits

- Metadata and schema were checked against `src/lib/site.ts`, each route file, the image routes, and pre-existing prerendered HTML.
- The first-text samples are the first approximately 1,200 normalized characters in the prerendered `<body>`, with scripts, styles, and SVG contents removed. CSS-hidden ordinary HTML can still appear in this sequence; the samples are evidence of server HTML, not a visual viewport transcript.
- “Server component modules” counts authored project modules in the first-render tree, including `RootLayout` and the route page, stopping traversal at a Client boundary. Local helper functions inside a module are not counted separately.
- “Client boundary modules” counts unique project Client entry modules in the Next client-reference manifest, excluding framework and shared error boundaries. A top-level Client poster therefore counts as one boundary even though all of its imports join the client graph.
- Payload figures come from the pre-existing local production artifact whose build ID was `qNFv9jd8q4QZPP2pTUjr6` and whose `BUILD_ID` mtime was `2026-08-01T17:57:35+1000`. They are raw files/assets on disk, not compressed network transfer. A fresh audited build can differ and belongs in the performance baseline/after reports.
- “Initial JS” is the sum of unique JavaScript files referenced by the prerendered route HTML. It includes shared Next runtime. It is not a route-exclusive bundle size.
- JSON prop bytes are `Buffer.byteLength(JSON.stringify(value))` for the values constructed by the current page code. They approximate serialized client props but are not a substitute for the RSC file measurement.
- Browser-only facts such as actual 320 px clipping, focus order, layout shift, and hydration errors remain `unknown` here unless the source code establishes the behavior directly.

## Route payload and boundary matrix

| Route | HTML bytes | RSC bytes | Initial JS, raw bytes | JS requests | Server modules | Client boundary modules |
|---|---:|---:|---:|---:|---:|---:|
| `/` | 40,065 | 20,849 | 670,246 | 11 | 7 | 0 |
| `/words` | 41,726 | 22,015 | 670,246 | 11 | 4 | 0 |
| `/about` | 168,702 | 82,980 | 677,141 | 11 | 4 | 3 |
| `/words/forever` | 1,577,554 | 1,104,912 | 1,336,840 | 13 | 4 | 1 |
| `/words/privacy` | 1,478,587 | 337,119 | 1,007,041 | 12 | 6 | 9 |
| `/words/artificial` | 171,898 | 30,266 | 1,424,821 | 13 | 6 | 7 |
| `/words/hub` | 439,658 | 147,699 | 1,330,183 | 13 | 6 | 4 |
| `/words/depression` | 1,715,718 | 1,319,717 | 820,384 | 12 | 4 | 1 |
| `/words/data` | 427,771 | 148,070 | 746,339 | 12 | 6 | 6 |

Authored module interpretation:

- `/`: `RootLayout`, `Home`, `JsonLd`, `Nav`, `PosterMarks`, `WordList`, `WordCard`; no authored Client boundary.
- `/words`: `RootLayout`, page, `JsonLd`, `Nav`; no authored Client boundary.
- `/about`: `RootLayout`, page, `JsonLd`, `Nav`; Client boundaries are `AboutSectionNav`, `GridRuler`, and `MethodDiagram`.
- `/words/forever`: `RootLayout`, page, `JsonLd`, `WordSeoSummary`; the entire `ForeverPoster` is one Client boundary, so its `Nav`, headings, prose, all figures, inspector, and Three.js enhancement are in the client graph.
- `/words/privacy`: `RootLayout`, page, `JsonLd`, `PrivacyPoster`, `Nav`, `WordSeoSummary`; seven privacy charts plus `PanelProgress` and `PosterSection` are Client boundaries.
- `/words/artificial`: `RootLayout`, page, `JsonLd`, `ArtificialPoster`, `Nav`, `WordSeoSummary`; six chart entry modules plus `PosterSection` are Client boundaries.
- `/words/hub`: `RootLayout`, page, `JsonLd`, `HubPoster`, `Nav`, `WordSeoSummary`; four chart modules are Client boundaries.
- `/words/depression`: `RootLayout`, page, `JsonLd`, `WordSeoSummary`; the entire `DepressionPoster` is one Client boundary.
- `/words/data`: `RootLayout`, page, `JsonLd`, `DataPoster`, `Nav`, `WordSeoSummary`; four charts plus `PanelProgress` and `PosterSection` are Client boundaries.

## Metadata and structured-data matrix

All canonical and Open Graph URLs below use the default `https://www.wordsovertime.com` base. A deployment that overrides `NEXT_PUBLIC_SITE_URL` can change them. The observed root canonical/OG URL is serialized without a terminal slash; the code’s URL builder treats `/` as the root.

| Route | `<title>` | Visible H1(s) | Meta description | Canonical | OG type / title / image | JSON-LD types |
|---|---|---|---|---|---|---|
| `/` | `Words Over Time: Word Meaning, History, and Usage` | `Words Over Time: semantic change and word usage over time` | `Explore source-led visual studies of word meaning, etymology, semantic change, and usage over time by artist and design researcher Dai Pan.` | `https://www.wordsovertime.com` | `website`; same title plus ` | Words Over Time`; `/opengraph-image` | `WebSite`, `Person`, `DefinedTermSet`, `CollectionPage` |
| `/words` | `Word Studies: Meaning and Usage Over Time | Words Over Time` | `word studies` | `Browse source-led visual studies of how privacy, forever, artificial, hub, depression, and data changed in meaning and usage over time.` | `https://www.wordsovertime.com/words` | `website`; page title; `/opengraph-image` | `CollectionPage`, `BreadcrumbList`, `Person` |
| `/about` | `Methodology, Sources, and Rights | Words Over Time` | `Words Over Time`; `methodology` | `Read the research methods, source-provenance rules, evidence boundaries, licenses, and publication rights behind Words Over Time.` | `https://www.wordsovertime.com/about` | `article`; page title; `/opengraph-image` | `AboutPage`, `BreadcrumbList`, `Person` |
| `/words/forever` | `Forever Spelling, Meaning, and Origin | Words Over Time` | `forever` | `Explore how “for ever” became “forever,” and how the word shifted across duration, devotion, memory, archives, and platform persistence.` | `https://www.wordsovertime.com/words/forever` | `article`; page title; `/words/forever/opengraph-image` | `WebPage`, `BreadcrumbList`, `Person`, `DefinedTerm`, `Article` + `CreativeWork`, `Dataset` |
| `/words/privacy` | `Privacy Etymology and Meaning Over Time | Words Over Time` | `privacy` | `Trace privacy from private life and secrecy to legal rights, data protection, surveillance, consent, and digital governance.` | `https://www.wordsovertime.com/words/privacy` | `article`; page title; `/words/privacy/opengraph-image` | Same six word-page graph entries |
| `/words/artificial` | `Artificial Etymology: Artifice to AI | Words Over Time` | `artificial` | `Trace artificial from artifice and skilled making to imitation, synthetic materials, suspicion, technical reproduction, and machine intelligence.` | `https://www.wordsovertime.com/words/artificial` | `article`; page title; `/words/artificial/opengraph-image` | Same six word-page graph entries |
| `/words/hub` | `Hub Etymology: From Wheel Center to Network | Words Over Time` | `hub` | `Trace hub from a wheel center to transport node, commercial center, digital access point, and network metaphor.` | `https://www.wordsovertime.com/words/hub` | `article`; page title; `/words/hub/opengraph-image` | Same six word-page graph entries |
| `/words/depression` | `Depression: Economic and Clinical Meanings | Words Over Time` | `depression` | `Trace depression across physical loweredness, melancholy, weather, economic crisis, clinical diagnosis, and public-health discourse.` | `https://www.wordsovertime.com/words/depression` | `article`; page title; `/words/depression/opengraph-image` | Same six word-page graph entries |
| `/words/data` | `Data Etymology: Datum, Meaning, and Usage | Words Over Time` | `data` | `Trace data and datum from given facts and counted observations to social traces, infrastructure, governance, and AI-era material.` | `https://www.wordsovertime.com/words/data` | `article`; page title; `/words/data/opengraph-image` | Same six word-page graph entries |

Important schema observations:

- Existing schema is substantial and should not be duplicated for quantity. Word routes already model the page, breadcrumb, author, term, article/creative work, and dataset in one graph.
- Current `Dataset` nodes include name, description, URL, image, dates, access, license pointer, keywords, creator/publisher, page/collection/term relations, and `measurementTechnique`.
- Current `Dataset` nodes do **not** provide `identifier`, `version`, `temporalCoverage`, `isBasedOn`, `sameAs`, `variableMeasured`, or `distribution`. Whether any can be added accurately is a research/modeling decision, not a metadata-fill exercise.
- `/about` has two actual H1 elements. This is a verified heading-hierarchy defect, not a search-performance inference.

## Initial data crossing into Client Components

| Route | Initial client data |
|---|---|
| `/` | None from authored server code. The word records are rendered through Server Components. |
| `/words` | None from authored server code. `wordRoutes` is rendered server-side. |
| `/about` | The three Client components receive no props; their section definitions/legend content are module constants. |
| `/words/forever` | One `dataset` prop containing coverage, source layers, eras, frequency series, prehistory, modern context, phrases, collocates, snippets, categories, flows, atlas, ledger, network, and inspectors. Frequency points are reduced to `{year, frequencyPerMillion}` but the rest of the generated dataset remains. Approximate JSON prop size: **1,085,004 bytes**, including **738,779 bytes of inspectors**, 115,089 bytes of frequency data, and 70,411 bytes of atlas data. |
| `/words/privacy` | Seven source-bounded slices: semantic weather (8,393 bytes), legal injury (14,632), modern transit (31,918), geographic attention (74,735), elevation (47,104), demographic context (113,489), and research expansion (11,725); aggregate wrapper estimate **302,119 bytes**. `PrivacyChart02GeoAttention` also imports the 252,308-byte source `world_countries_geojson.json` into the client graph rather than receiving it as a prop. |
| `/words/artificial` | No server-prop dataset. Chart geometry, labels, evidence notes, and many semantic records are module constants inside Client components. Several components import Three.js directly, so “no prop JSON” does not mean “light client data.” |
| `/words/hub` | Four derived objects are built in the Server component and passed as `data`: semantic-frequency layers/evidence/cautions; transfer flows/evidence/layers/route strata/timeline; naming families/patterns/cautions; dependency tiers/object spectrum/form groups/boundaries. Exact `JSON.stringify` prop bytes: `unknown` without executing the TypeScript builders; measured route RSC is 147,699 bytes. Two client charts import Three.js. |
| `/words/depression` | Five props enter one top-level Client poster: reduced frequency (493,710 bytes), prehistory (7,780), branches (6,784), normalized evidence (780,707), coverage (10,087); aggregate wrapper estimate **1,299,132 bytes**. The poster then builds a large inspector map with `useMemo`. |
| `/words/data` | Four complete generated datasets: historical index (41,436 bytes), socialized generation (32,718), datum route (12,858), cross-pressures (32,824); aggregate wrapper estimate **119,915 bytes**. |

## Per-route inventory

### `/`

Configured search intents: `word usage over time`; `word meaning over time`; `semantic change words`; `word frequency over time`.

First server-rendered text (all 402 normalized non-SVG characters):

> Words Over Time About words you wanna know: forever long promise / artificial made meaning / privacy private weather / hub center moved / depression double crisis / intelligence coming soon / data social count / over time Semantic change / word frequency / search statistics / design research / infographic art by Dai Pan / 潘岱. palette / system Words Over Time: semantic change and word usage over time

Primary internal links: `/`, `/about`, and the six complete word routes. There is no `/words` link in the primary navigation or homepage content.

Mobile behavior and visibility:

- The word composition uses a minimum `clamp()` size of 3.9rem and wraps each editorial row in `whitespace-nowrap`. At 320 px this is a direct horizontal-overflow risk; browser measurement is still required for the exact overflow width.
- Available-word research labels and the `coming soon` status are absolutely positioned and `hidden` until `group-hover`. Touch users therefore do not receive persistent status/context. The completed words remain links, but their meaning is not equivalent to the hover label.
- `PosterMarks` is hidden below `lg`; it is decorative, not essential.
- The visually large word list is not the H1. The single H1 is a 0.68rem, low-emphasis line after the flexible hero, so the first screen does not present the primary heading as the visual explanation of the project.
- Essential status/context is partially hidden on mobile: **yes**. Essential route links are not hidden.

### `/words`

Configured search intents: `word studies`; `word usage over time`; `word meaning over time`; `semantic change examples`; `word history studies`.

First approximately 1,200 server-rendered text characters:

> Words Over Time About words over time / index word studies Browse the public studies currently available for search engines, readers, and AI retrieval tools. Each entry links to a canonical route with metadata, structured data, source notes, and explicit publication boundaries. 01 forever / Forever is read as a promise of duration whose meaning changes when memory becomes archival, searchable, platformed, and hard to delete. forever permanence memory archive platform persistence 02 artificial / Artificial moves from skilled making and artifice toward synthetic materials, reproduced experience, suspicion, and the boundary between human and machine intelligence. artificial artifice imitation synthetic machine intelligence 03 privacy / Privacy is traced from private life and secrecy into legal rights, data protection, public attention, surveillance, consent, and governance interfaces. privacy data protection surveillance consent legal injury 04 hub / Hub begins as a center of rotation and becomes a transport, commercial, digital, and platform term for access, routing, and control. hub network transportation platform centrality 05 depression / Depression branches through loweredness, m

Primary internal links: `/`, `/about`, and all six word routes.

Mobile behavior and visibility:

- The route is server-only at the authored-component level and changes from the three-column desktop list to a single-column mobile list.
- Each entry keeps title, summary, and up to five keyword tags visible without hover.
- No source-level required horizontal scroller or mobile-only hidden research content was found. Actual 320 px wrapping/zoom behavior remains a browser-QA item.
- Essential content hidden on mobile: **no, by static inspection**.

### `/about`

No `searchIntents` array is configured. The visible/metadata intent is methodology, source provenance, calculation method, claim boundaries, citation, rights, licensing, and site privacy.

First approximately 1,200 server-rendered text characters:

> WOT 00 Statement 01 Methodology 02 Design Research 03 Evidence 04 Sources 05 Methods 06 Position 07 Open Skill 08 GitHub 09 Licensing 00 Words Over Time About 01 signal 02 attestation 03 variant 04 context 05 boundary 06 rights 00 / project statement Words Over Time is a semantic-frequency research project, design research, and infographic art. Words Over Time is made by Dai Pan / 潘岱, a Chinese artist, designer, and design researcher. It treats language as visual material: a field of memory, evidence, attention, and public pressure that can be studied through semantic change, word frequency, search statistics, and source-led interpretation. This is not a dictionary. It does not define words. It does not claim that frequency reflects importance, that Gutenberg texts represent all historical usage, or that modern news snippets are comparable to historical corpora. What it does claim is that the available evidence is worth making visible, with its sources, limits, and gaps stated alongside the data. Dai Pan / visual art, photography, printmaking, design research Dai Pan / writing, image-text worlds, poetic research Intended audience: researchers, writers, educators, designers, artists

Primary internal links: `/`, `/about`, all six word routes, and `#project-statement`, `#methodology`, `#design-research`, `#layered-evidence`, `#source-ledger`, `#calculation-methods`, `#claim-boundaries`, `#open-skill`, `#open-source`, `#licensing`. Significant external links include the author sites, project/skill repositories, and license sources. There is no direct `/words` link.

Mobile behavior and visibility:

- The fixed chapter rail is `hidden` below `lg`, but the anchored sections remain in document order. Mobile loses the only chapter-jump UI.
- The six-column `GridRuler` remains, while labels are visually suppressed below `sm` until expanded. It is a full-width button but lacks an explicit `aria-expanded` state.
- The source ledger uses an intentional `overflow-x-auto` table with `min-w-[560px]`; the content is not removed, but horizontal reading is required.
- All primary research prose remains visible. Essential content hidden: **no**; useful navigation is hidden.
- Verified defect: two H1s (`Words Over Time` and `methodology`).

### `/words/forever`

Configured search intents: spelling; `is forever one word`; `for ever or forever`; meaning; duration; origin; etymology; history; semantic change; digital permanence.

First approximately 1,200 server-rendered text characters:

> Words Over Time About Words Over Time / word page forever A word traced through permanence, repetition, devotion, memory, and time. Five layers of evidence. One word. Semantic evolution / company / meaning / proof. ngram 1500-2022 archive 1726-1930 modern 2024-2026 01A Frequency 01B Bloom 01C Spiral 02 Doubt 03 Constellation 04 Signal 05 Archive era filters all panels All All available real-data coverage. 1700-1799 Sparse Gutenberg seed coverage; Ngram coverage is available. 1800-1849 Gutenberg seed texts and Ngram coverage. 1850-1899 Strongest Gutenberg context coverage in the current corpus layer. 1900-1949 Limited public-domain context texts in the current corpus layer. 1950-1999 Ngram coverage only in this round; no Gutenberg snippets selected. 2000-2025 Ngram coverage only in this round; recent contextual corpus not implemented. 01 / semantic evolution Semantic evolution The first movement keeps the frequency curve, then splits the historical pressure layer into a bloom and a recurrence spiral: forever as spelling drift, cultural force, and repeated return. 01A / frequency trace written variants, kept visible without requiring hover frequency field This visualization requires

Primary internal links: `/`, `/about`, `/words/artificial`, `/words/privacy`, `/words/data`, `/words`. Existing section IDs include `#semantic-evolution`, `#permanence-under-suspicion`, `#relational-constellation`, `#context-signal-field`, and `#evidence-archive`, but no visible chapter navigation links to them.

Mobile behavior and visibility:

- At widths below Tailwind `sm` (640 px), `FrequencyTimeline` hides the real SVG (`hidden sm:block`) and shows: “This visualization requires a wider screen. Rotate your device or view on desktop for the full chart.” Only up to four series labels and their coverage years remain. The values, trend shapes, scale, and mark inspection are absent.
- The desktop frequency SVG has `min-w-[1320px]`; constellation, signal field, and evidence archive use horizontal scrollers with minimum widths of 1,540, 1,400, and 1,420 px.
- The institutional-doubt section initializes a Three.js canvas and includes pointer-based manipulation. The entire poster, including its H1 and prose, sits in one Client graph even though SSR produces HTML.
- `PanelProgress` hides panel labels below `sm`, leaving numbers/dots.
- The raw server text is source-rich, but the direct spelling/origin answer promised by the metadata is not present near the top; the only canonical summary is at the bottom.
- Essential content hidden on mobile: **yes — the actual frequency chart**. Other primary figures are present but require horizontal scrolling or pointer interaction.

### `/words/privacy`

Configured search intents: etymology; word origin; history of meaning; meaning over time; historical definition; legal meaning; data protection; surveillance history; modern meaning.

First approximately 1,200 server-rendered text characters:

> Words Over Time About Words Over Time / lexical study privacy A word that moves from private life and secrecy, into legal and data systems, across geography, then into governance interfaces. Seclusion / secrecy / legal claim / data protection / geography / population / consent / surveillance / AI-sensitive data. study word history scope 1200-2026 sequence 01A-03 / 7 views method source-led evidence not site privacy policy 01 Semantic Formation 02 World Signal 03 Governance Interface entry note Privacy does not begin as a digital panic, and it does not end as a single legal right. This page follows the word through an older semantic field of private life and secrecy, a legal and data-system transition, a geographic and demographic expansion of recovered signal, and a final interface layer where courts, regulators, platforms, public attention, and technical research braid the word into modern governance. 01 / semantic formation Before Privacy Became a Right Before privacy became a legal or digital issue, it moved through older fields of seclusion, secrecy, private life, and freedom from observation. 01A / semantic weather 1200-1890 / pre-rights semantic field evidence hover Move acro

Primary internal links: `/`, `/about`, `/words/data`, `/words/hub`, `/words/artificial`, `/words`. Section IDs are `#chart-1-semantic-weather`, `#chart-2-geo-attention`, and `#chart-3-governance-interface`; no visible chapter-link list points to them.

Mobile behavior and visibility:

- The H1, entry note, section introductions, interpretation paragraphs, and all seven figures remain in the SSR document.
- The figures generally scale SVGs to the mobile container instead of declaring a wide fallback. This prevents a code-level desktop-only block but can make dense labels too small; exact legibility is `unknown` until screenshot/zoom QA.
- `PanelProgress` hides its text labels below `sm`.
- Several marks expose evidence via hover; some use `tabIndex`/focus, while others only install mouse handlers. A source-level complete keyboard/touch grammar is not present across all seven charts.
- The demographic figure uses a full-viewport `w-screen` breakout with `overflow-hidden`; body overflow at each target width is `unknown` pending browser measurement.
- Essential content CSS-hidden on mobile: **no, by static inspection**. Some evidence detail is interaction-dependent.

### `/words/artificial`

Configured search intents: etymology; meaning; word origin; relation to artifice; meaning over time; “created by artificial means”; meaning before AI; artificial-intelligence word history.

First approximately 1,200 server-rendered text characters:

> Words Over Time About Words Over Time / word study artificial A word that moves from skilled making to synthetic matter, reproduced experience, suspicion, and the human boundary. Artifice / manufacture / reproduction / suspicion / body / cognition. status near complete sequence five charts mode interactive atlas scope artifice to ai 01 Semantic Chamber 02 Under Pressure 03 Mechanical Reproduction 04 Suspicion / Distance 05 Human Boundary entry note Five linked charts trace artificial from artifice before fake into manufactured perception, mechanical reproduction, suspicion, semantic distance, and finally the boundary where artificial enters bodies, voices, and cognition. 01 / semantic chamber Artificial before fake A spatial reading of Chart 1, where three semantic planes keep word family, technical construction, and sense boundaries visible at once. Chart 01 Semantic chamber resting word family technical sense boundary full overlay “artificial” in its semantic space, before analysis. hover a node to inspect quality pressure N S natural copy — lifelike — true to life — high fidelity 02 / under pressure Artificial Under Pressure A single hover-state diagram: the resting view fixes t

Primary internal links: `/`, `/about`, `/words/forever`, `/words/data`, `/words/privacy`, `/words`. Section IDs are chart-number IDs rather than stable query-intent anchors.

Mobile behavior and visibility:

- The Server-rendered poster keeps the H1 and section introductions outside the chart Client boundaries.
- Chart 02 is explicitly 190% wide with `min-w-[1026px]` inside a horizontal scroller. Chart 03 parts use minimum widths of 680 and 1,160 px.
- Chart 01 keeps a fixed 180 px control rail alongside a canvas at all breakpoints; on a 320 px viewport the remaining canvas width is very small. Charts 04/05 use 720-820 px fixed-height Three.js fields with overlaid inspectors/legends.
- Three.js is imported by five artificial chart modules. These are initial boundaries, not below-fold dynamic imports.
- No complete section is CSS-hidden on mobile, but multiple primary figures are functionally compressed, horizontally scrolled, or dependent on hover/3D selection. Essential meaning hidden: **not literally hidden; meaningful mobile equivalence is absent for several figures**.

### `/words/hub`

Configured search intents: etymology; word origin; original meaning; why a center is called a hub; meaning over time; transportation; network metaphor; digital platform meaning.

First approximately 1,200 server-rendered text characters:

> Words Over Time About Words Over Time / word page hub A word whose center moved from the wheel to the systems around us. Wheel center / city center / transfer point / network node / institutional access point. ngram 1800-2022 chart 01 semantic field layers 5 queries 62 01 Semantic Frequency Field 02 Transfer Model 03 Naming Machine 04 Stable Format entry note The first chart separates lexical survival from semantic dominance. The wheel sense remains present, but the modern visibility field is led by institutional, transport, and central-place uses. 01 / semantic frequency field A Word Whose Center Moved Five semantic layers use Ngram proxy-frequency data and strengthened evidence notes to show where hub remains mechanical, where it becomes a place center, and where it becomes a system center. Animated semantic field / drag to interrupt / select to isolate semantic field overview All Semantic Layers No single layer is isolated. All five semantic circles stay clear so the full movement from wheel center to modern access point can be read together. View state All layers visible Modern center Institutional / Digital Hub Wheel sense Backgrounded Layer count 5 circles all All layers clea

Primary internal links: `/`, `/about`, `/words/privacy`, `/words/data`, `/words/artificial`, `/words`. The custom `HubSection` does not accept an `id`, so the four main research chapters lack stable section anchors.

Mobile behavior and visibility:

- The Server poster keeps H1, entry note, evidence cards, cautions, and chapter introductions in static HTML.
- Chart 01 is an 880 px-high Three.js canvas followed by a textual inspector/control stack; touch drag and explicit layer buttons exist. Chart 03 also includes Three.js plus a radial SVG and explicit family buttons.
- Charts 02 and 04 scale dense 1,200/820-unit SVGs to the container. Many chart marks use mouse hover; not all mark groups expose focus semantics, although separate buttons/tables preserve part of the reading.
- No main section is CSS-hidden on mobile. Dense SVG labels and long canvases may be too small or tall; exact behavior is `unknown` until target-viewport screenshots.
- Essential content hidden: **no, by static inspection**; interaction-equivalent evidence is incomplete.

### `/words/depression`

Configured search intents: etymology; origin; meaning over time; economic versus clinical meaning; weather meaning; melancholy history; semantic branching.

First approximately 1,200 server-rendered text characters:

> Words Over Time About Words Over Time / word page depression A record of how one word branches through seven centuries, from loweredness and melancholy to economy, diagnosis, and public discourse. ngram 1500-2022 lexical 1300-1930 archive 1621-1930 modern 2012-2026 01 / HISTORICAL SEMANTIC PLATE Geometric semantic anatomy The spine runs from c.1300 to the present. Branches mark where a sense of the word first becomes visible in the evidence. Width reflects corpus frequency, not importance. 02 / MODERN SEMANTIC MACHINE Depression as a semantic machine Each gear is a subsystem through which depression passes in modern usage. Gear size maps to semantic weight. Motion travels only through explicit relation groups; the center is a hinge, not the engine. The machine shows how the word is held in place. But depression also keeps moving, outward into social life, loosened from any single system. The next loop maps that diffusion: through affect, economy, burnout, media, and care. 03 / SOCIAL ATMOSPHERE LOOP Depression as a social atmosphere all emotional economic cultural response Each domain reshapes what the word can do. What stays intact in lived experience gets compressed in clinical m

Primary internal links: `/`, `/about`, `/words/forever`, `/words/privacy`, `/words/data`, `/words`. Only later wrapper IDs `#chart-03` and `#chart-04` exist; the first two `PosterSection` instances have no IDs.

Mobile behavior and visibility:

- The entire poster is one Client boundary and receives approximately 1.30 MB of JSON props; H1/prose still appear in prerendered HTML, but hydration owns the route shell and inspector state.
- Historical plate uses `min-w-[1080px]`, atmosphere loop `min-w-[1080px]`, living-method map `min-w-[1120px]`, and translation map `min-w-[1180px]`, all in horizontal scrollers. The semantic machine scales to container width instead.
- Figure marks generally use mouse hover plus click/pointer selection, but no consistent `tabIndex`/keyboard semantics were found for the SVG evidence marks.
- The annotation strip is fixed to the bottom when active. Whether it covers content or restores focus appropriately is `unknown` pending browser interaction QA.
- No research chapter is CSS-hidden on mobile; essential meaning is **present as prose but the visual translations require wide horizontal exploration**.

### `/words/data`

Configured search intents: etymology; datum/data origin; meaning over time; singular/plural grammar; “data are” versus “data is”; given facts; AI meaning; governance meaning.

First approximately 1,200 server-rendered text characters:

> Words Over Time About Words Over Time / word page data A word that turns facts into infrastructure. Given facts / collected records / processing systems / platform traces / training material / contested ground. ngram 1630-2022 index 1630-2026 panels 2 stems 32 01 Historical Index 02 Socialized Data 03 Grammatical Route 04 Cross-Pressures entry note Data begins as something given: facts, observations, premises for argument. It becomes something collected, stored, processed, mined, and used to train systems. This page traces that turn through four charts: a historical index, a platform-era social acceleration, a grammatical shift, and a map of contested pressures. 01 / historical index A Historical Index of Data Data has always been an infrastructural term. This chart reads that fact through a dual-panel timeline: long formation above, contemporary acceleration below. The split keeps recent density visible without letting it swallow four hundred years of systematic thinking about facts, evidence, and counted things. Chart 1 / historical index This index traces how data moves from given facts into systems of collection, processing, storage, governance, and training. The upper panel sh

Primary internal links: `/`, `/about`, `/words/privacy`, `/words/hub`, `/words/artificial`, `/words`. Section IDs are `#chart-1-historical-index`, `#chart-2-socialized-generation`, `#chart-3-datum-route`, and `#chart-4-cross-pressures`; no visible chapter links point to them.

Mobile behavior and visibility:

- H1, entry note, chart titles/intros, synthesis, and canonical summary are Server-rendered outside the chart boundaries.
- Historical index uses computed wide minimum widths; socialized generation uses `min-w-[1340px]`; datum route has two 1,480 px horizontal scrollers; cross-pressures uses `min-w-[1440px]`.
- Cross-pressure marks expose focus/click semantics; other chart marks rely more heavily on mouse hover. The figures remain in the DOM but do not have a selected-series or ranked mobile alternative.
- `PanelProgress` hides panel labels below `sm`.
- Essential content CSS-hidden: **no**. Primary figures require desktop-width horizontal traversal and therefore lack a purpose-built mobile reading sequence.

## Cross-route findings for implementation prioritization

1. **P0 mobile research gap:** `/words/forever` explicitly removes the real frequency chart below 640 px. This is a verified implementation fact, not a performance or ranking inference.
2. **P0 homepage discovery gap:** primary navigation exposes only Home/About, not `/words`; homepage status and research cues are hover-only; `whitespace-nowrap` plus oversized minimum type is a 320 px overflow risk.
3. **P0 accessibility/IA defect:** `/about` renders two H1s. Its useful chapter navigation is desktop-only.
4. **P1 architecture:** Forever and Depression each make the whole poster a Client boundary and serialize more than 1 MB of route data. Artificial has little RSC data but the largest observed initial-JS sum because multiple Three.js charts are immediate Client entries. These are different problems and should not be conflated.
5. **P1 mobile visual system:** Privacy/Hub keep more explanatory prose visible and Data/Depression/Forever keep wide diagrams inside local scrollers, but none implements a consistent mobile sequence of summary, focused chart, interpretation, evidence action, and table alternative.
6. **P1 query-to-first-screen mismatch:** route metadata names spelling, etymology, definition, origin, and grammar intents, while first-screen copy usually states a broad thesis. The code does not yet provide a top-of-page source-bounded direct answer with stable intent anchors.
7. **Already correct and not to duplicate:** route-specific metadata, canonical URLs, OG/Twitter images, sitemap/robots/feed/llms surfaces, DefinedTerm/Article/Dataset/Breadcrumb schema, public `/words` index, route search-intent arrays, and bottom related-study links already exist.
8. **No ranking claim:** the inventory cannot distinguish low ranking from low CTR because average position is unavailable. It also cannot conclude that zero clicks are caused by snippets.

## Files and evidence inspected

Minimum route/system files inspected:

- `README.md`, `package.json`, `.node-version`, `next.config.ts`, `vercel.json`
- `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/about/page.tsx`, `src/app/words/page.tsx`, all six canonical word `page.tsx` files, plus the untracked privacy demo read-only
- `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/feed.xml/route.ts`, `src/app/llms.txt/route.ts`
- default and word-route Open Graph/Twitter image routes, `src/lib/og-image.tsx`
- `src/lib/site.ts`, `src/components/JsonLd.tsx`, `Nav`, `WordList`, `WordCard`, `WordSeoSummary`
- all top-level poster modules, `FrequencyTimeline`, and the route-relevant major privacy, artificial, hub, depression, and data visual modules
- `src/app/globals.css`, generated-data type definitions, and the client-reference manifests/prerendered HTML from the pre-existing local build
- `docs/launch/search_console_indexing_plan.md`, `docs/launch/seo-promotion-checklist.md`, and `docs/launch/infographic-editorial-design-skill-launch.md`

Production HTTP behavior, live response headers, browser screenshots, Lighthouse values, actual mobile overflow, hydration warnings, and compressed transferred bytes are intentionally not asserted in this static route inventory.

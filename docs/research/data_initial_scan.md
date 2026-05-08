# Words Over Time: "data" Initial Research And Data Scan

Generated: 2026-05-08  
Status: foundation scan only; no final charts or React components implemented

## Executive Summary

"Data" is a strong candidate for a Words Over Time page, but the best story is probably not a single emotional or semantic drift. It is a chained infrastructure story: a Latin plural meaning "things given" becomes the language of empirical evidence, statistical records, machine-processable information, databases, web/user traces, platform surveillance, and AI training material.

The long-run frequency signal is usable but should not carry the page alone. A preliminary Google Books Ngram JSON probe for English, 1800-2022, shows "data" already present through the nineteenth century at low scholarly/statistical levels, then rising sharply in the twentieth century. Average case-insensitive frequency per million in the probe was about 9.2 for 1800-1899, 76.0 for 1900-1949, 356.1 for 1950-1999, and 370.3 for 2000-2022, with a local maximum around 1983. This is a printed-books signal, not a full-language signal.

The most promising visual direction is a temporal semantic chain or layered network in which "data" branches into families: evidence/statistics, processing/storage/database, analysis/decision, personal/user/privacy/protection, big/open/datafication, and AI/training/model. Compound terms are likely more revealing than the headword because they expose the domains where "data" changes function.

## Key Findings

- "Data" is historically plural: Latin *data*, plural of *datum*, literally "things given." Lexical sources trace English use to the seventeenth century and connect early use to facts granted as a basis for calculation or reasoning.
- Early English use appears scholarly, mathematical, scientific, and evidentiary. It should not be presented as a purely digital word.
- Dictionaries now treat "data" as plural in form but singular or plural in construction. Modern digital/computing senses usually behave as a mass noun, parallel to "information."
- Google Books suggests a long low baseline through the nineteenth century, then twentieth-century acceleration, especially after the rise of statistics, administrative science, electronic computing, and data processing.
- British/American differences are visible but not definitive. In the preliminary Ngram probe, US English has higher post-1950 "data" and "database" frequency, while British English has much stronger "data protection" and somewhat stronger recent "personal data," likely reflecting legal and policy vocabulary.
- "Data processing" rises strongly from the 1950s and peaks around the 1970s. "Database" becomes visually strong from the 1970s-1990s. "Big data," "data science," "data-driven," "open data," "training data," and "data privacy" are mostly twenty-first-century public-book signals.
- For the final page, the strongest conceptual path is not "meaning changes from X to Y," but "a word becomes infrastructure": collection -> storage -> processing -> analysis -> prediction -> decision -> governance.

## Historical Frequency Scan

### Preliminary Google Books Ngram Probe

Source: Google Books Ngram JSON endpoint, corpus `en`, case-insensitive, smoothing 0, year range 1800-2022. The app's existing scripts already use the same endpoint and convert Ngram fractions to frequency per million.

Selected case-insensitive English results, frequency per million:

| Term | Approximate pattern from preliminary probe | Notes |
|---|---:|---|
| data | avg 1800s 9.19; avg 1900-1949 75.97; avg 1950-1999 356.12; avg 2000-2022 370.34; max 511.94 @ 1983 | Strong long-run line, but sense mix is broad. |
| datum | avg 1800s 0.74; avg 1900-1949 2.74; avg 1950-1999 4.73; avg 2000-2022 1.61; max 32.41 @ 1950 | Useful contrast: singular technical form peaks mid-century then recedes. |
| data processing | reaches >=1 per million in 1954; max 15.48 @ 1978 | Strong computing/administrative bridge term. |
| database | reaches >=1 per million in 1900 in case-insensitive aggregate, but modern technical use is better interpreted from 1960s/1970s onward; max 47.92 @ 1993 | Early hits likely include noise or non-modern segmentation; lexical sources date technical term circa 1962. |
| statistical data | reaches >=1 per million in 1923; max 3.77 @ 1932 | Good empirical/statistical branch marker. |
| data collection | reaches >=1 per million in 1962; max 8.08 @ 2022 | Works as a procedural/infrastructure node. |
| data analysis | reaches >=1 per million in 1965; max 7.06 @ 2022 | Analysis/decision branch. |
| personal data | reaches >=1 per million in 1967 in aggregate; max 9.22 @ 2008 | Legal/social branch; needs snippet review because early uses may not match modern privacy sense. |
| data protection | reaches >=1 per million in 2000; max 3.36 @ 2022 | Strong British/EU policy branch. |
| data mining | reaches >=1 per million in 2000; max 3.65 @ 2008 | Technical/commercial extraction branch. |
| big data | reaches >=1 per million in 2013; max 10.58 @ 2021 | Strong twenty-first-century annotation candidate. |
| data science | reaches >=1 per million in 2018; max 2.37 @ 2022 | Strong recent professional/academic branch. |
| training data | reaches >=1 per million in 2005; max 2.75 @ 2022 | AI/ML branch, but "training" can create earlier ambiguous hits. |
| data-driven | reaches >=1 per million in 2017; max 2.81 @ 2022 | Decision/management/AI-adjacent branch. |
| data privacy | does not reach 1 per million in probe; max 0.89 @ 2022 | Recent and socially important despite lower book frequency. |
| data breach | does not reach 1 per million; max 0.37 @ 2021 | Better in news corpora than books. |

### British vs American Scan

Same preliminary method, selected terms:

| Term | English avg 2000-2022 | American English avg 2000-2022 | British English avg 2000-2022 | Preliminary interpretation |
|---|---:|---:|---:|---|
| data | 370.34 | 384.13 | 298.95 | US line is higher in books after 1950; may reflect technical/scientific publishing mix. |
| datum | 1.61 | 1.60 | 1.42 | Singular form declines in both. |
| database | 35.01 | 37.46 | 25.04 | US higher; fits computing/business publishing. |
| personal data | 2.02 | 1.85 | 3.14 | British stronger recently; likely legal/privacy discourse. |
| data protection | 1.58 | 0.87 | 4.46 | British much stronger, consistent with UK/EU legal phraseology. |
| big data | 2.79 | 3.00 | 2.20 | Similar broad rise; US slightly higher. |

### Cautions

Google Books Ngram is useful for printed-language visibility, not for direct social prevalence. It has known OCR, dating, corpus-composition, genre, and representativeness limitations. The final page should use Ngram as a baseline layer and validate claims with COHA/COCA/NOW, dictionaries, and manually reviewed snippets.

Sources for Ngram method and limitations:

- Google Research announcement of the Ngram Viewer and downloadable datasets: https://research.google/blog/find-out-whats-in-a-word-or-five-with-the-google-books-ngram-viewer/
- Google Ngram Viewer graph for "data": https://books.google.com/ngrams/graph?content=data
- PLOS One guidelines on improving reliability of Google Ngram studies: https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0213554
- Discussion of Ngram possibilities/limitations in management research: https://www.mdpi.com/2075-4698/12/6/171

## Lexical And Etymological Scan

### Origin

The word comes from Latin *data*, the classical plural of *datum*, from *dare*, "to give." The underlying conceptual frame is "things given": facts or premises granted as a basis for reasoning, calculation, or inference.

Etymonline records:

- 1640s: "a fact given or granted"
- classical use: a fact given as the basis for calculation in mathematical problems
- 1897: numerical facts collected for future reference
- 1946: transmittable/storable information used in computer operations
- 1954: data-processing
- 1962: data-base/database
- 1969: data-entry

Merriam-Webster gives first known use of "data" in 1630 and defines it as factual information used as a basis for reasoning, discussion, or calculation; digital information that can be transmitted or processed; and a philosophical sense of sensory output to be processed.

### Singular vs Plural

Modern dictionary treatment is important for the page because grammar tracks semantic massification:

- Merriam-Webster: "data" is plural in form but singular or plural in construction. It remains plural in technical/formal writing, but more commonly functions like a mass noun similar to "information."
- Britannica: "data" is technically plural but standard with both singular and plural verbs; plural verb is more formal/technical.
- Cambridge: "data" is marked as uncountable and singular/plural verb; it notes that although originally plural, it is now often used as an uncount noun with a singular verb.
- Dictionary.com: digital/computer "data" is almost always treated as a mass noun; the singular "datum" is rare except specialized fields such as surveying/civil engineering.

This suggests a visual/annotation opportunity: "data" moves from countable given facts toward a mass substance or resource, especially in computing and platform contexts.

Sources:

- Etymonline: https://www.etymonline.com/word/data
- Merriam-Webster data: https://www.merriam-webster.com/dictionary/data
- Merriam-Webster usage article: https://www.merriam-webster.com/wordplay/some-data-about-datum
- Britannica dictionary usage: https://www.britannica.com/dictionary/eb/qa/Is-Data-Singular-or-Plural-
- Cambridge data: https://dictionary.cambridge.org/dictionary/english/data
- Dictionary.com data: https://www.dictionary.com/browse/data
- Oxford Learner's datum: https://www.oxfordlearnersdictionaries.com/us/definition/english/datum

## Preliminary Semantic Phase Model

| Phase | Approx. period | Dominant associated meanings | Likely neighbouring words | Drivers | Support |
|---|---|---|---|---|---|
| Given facts / scholarly premises | 1600s-1800s | Facts granted for reasoning, calculation, philosophy, mathematics | datum, facts, given, observations, premises, calculation, evidence | Latin scholarly vocabulary, mathematics, philosophy, natural science | Strong lexical support; corpus context needs manual review. |
| Statistical and empirical evidence | 1800s-mid 1900s | Observations, measurements, tables, survey/statistical evidence | statistical data, empirical data, observations, figures, tables, experiments, census | State statistics, scientific method, public health, administrative recordkeeping | Strong; Ngram and dictionary evidence align. |
| Administrative and technical records | early-mid 1900s | Recorded information used by organizations, filing, tabulation, retrieval | records, tabulation, punched cards, data collection, data storage, data retrieval | Bureaucracy, census, punch-card systems, business administration | Moderate; needs archival snippets. |
| Electronic data processing | 1940s-1970s | Machine-readable information and operations performed by computers | computer data, digital data, data processing, input, output, tape, storage | Electronic computers, mainframes, magnetic tape/disk, business automation | Strong; Etymonline dates computing sense to 1946; Ngram shows data processing rising from 1950s. |
| Database and information systems | 1960s-1990s | Structured collections, retrieval, query, management systems | database, data base, DBMS, data bank, data model, relational, records, query | Direct-access storage, database management systems, relational model, enterprise computing | Strong; lexical sources date database circa 1962; Ngram visible in 1970s-1990s. |
| Web/platform/user data | 1990s-2010s | Logs, profiles, clicks, personal information, behavioural traces | user data, personal data, privacy, cookies, search data, metadata, data mining, data brokers | Internet, search engines, advertising, social media, mobile devices | Strong conceptually; book frequency lower for some terms, so news/policy corpora needed. |
| Big data / open data / datafication | 2000s-2010s | Massive datasets, analytics, civic/government openness, quantified social life | big data, open data, datafication, data-driven, analytics, platforms, surveillance | Web-scale computing, cloud, sensors, public-sector open data, analytics industry | Strong for big data/open data; "datafication" needs academic-source annotation more than frequency. |
| AI / training data / predictive systems | 2010s-2026 | Model training material, datasets, labels, bias, synthetic data, governance | training data, datasets, models, machine learning, AI, labels, Common Crawl, embeddings | Deep learning, foundation models, web corpora, dataset documentation, AI regulation | Strong recent direction; Ngram ends at 2022, so current 2023-2026 AI context requires web/news/academic sources. |

## Collocation And Compound-Term Exploration

| Term | Likely emergence / visible period | Relationship to "data" | Final visual role | Branch |
|---|---|---|---|---|
| statistical data | nineteenth-century roots; stronger early twentieth century | Frames data as numerical evidence | Annotation or early evidence line | Statistical / empirical |
| empirical data | nineteenth-century roots; stronger late twentieth century | Data as observed evidence | Secondary line or evidence node | Scientific |
| data collection | procedural term; visible from mid twentieth century, rising to 2022 | The intake step of data infrastructure | Infrastructure node / line | Technical / social science |
| data analysis | visible from 1960s, rising to 2022 | Turns records into interpretation | Infrastructure node / line | Technical / scientific |
| data processing | computing sense from 1950s; Ngram peak around 1978 | Machine handling of data | Major phase annotation | Computing / administrative |
| computer data | mid twentieth century | Ties data directly to computers | Small bridge annotation | Technical |
| digital data | mid-late twentieth century | Converts data from record/evidence to digital form | Bridge node | Technical |
| data storage | mid-late twentieth century | Data as stored resource | Infrastructure node | Technical |
| database / data-base | technical term circa 1962; strong 1970s-1990s | Structured collection of data | Major node or timeline band | Technical / commercial |
| metadata | coined/used in computing documentation in late 1960s; visible in books mainly after 1990s | Data about data; classification/indexing layer | Node or annotation | Technical / archival |
| data set / dataset | "data set" becomes technical in 1970s; "dataset" grows strongly after 1990s | Unit/package of data | Timeline layer; useful AI bridge | Technical / AI |
| data mining | 1990s/2000s rise | Extractive analysis from large datasets | Node with cautionary social branch | Technical / commercial |
| big data | term popularized in 1990s/2000s; book signal after 2010 | Scale problem and industry concept | Major annotation / phase marker | Technical / commercial |
| open data | 2000s/2010s | Public/civic accessibility frame | Counter-branch to proprietary/platform data | Legal / civic |
| personal data | legal/privacy vocabulary; strong recent UK/EU signal | Data tied to identifiable persons | Social/legal branch node | Legal / social |
| user data | internet/platform vocabulary; modest book signal but high conceptual value | Data produced by users or about users | Social/platform node | Commercial / social |
| search data | current platform/search governance term | Query/click traces; connects to search culture | Manual annotation / curated node | Commercial / privacy |
| data privacy | mostly recent | Privacy risks around data collection/use | Node or comparison layer | Legal / social |
| data protection | strong UK/EU legal branch, especially post-1980 and GDPR-era | Regulatory framework around personal data | Major legal branch line | Legal |
| data breach | news-heavy term; book signal weaker | Harm/event frame around exposed data | News-corpus annotation | Legal / security |
| data-driven | strong 2010s/2020s | Data as basis for decisions, products, institutions | Decision-making branch node | Commercial / AI |
| data science | professional/academic identity, strong post-2010 | Data as discipline and labor market | Timeline annotation | Technical / professional |
| training data | ML/AI term; rises in 2000s and especially 2010s/2020s | Data as material used to train models | AI phase node | AI |
| synthetic data | likely late 2010s/2020s | Generated data as substitute/augmentation | Future deep-research candidate | AI / governance |
| datafication | academic/social theory term from 2010s | Turning life/processes into data | Curated concept annotation | Social / political |

## Visualization Opportunity Scan

### 1. Historical Frequency Line With Phase Bands

Data required: Ngram yearly series for data, datum, statistical data, data processing, database, personal data, big data, training data, data science, data protection. Optional COHA/COCA validation.

Could be built with curated/manual data: phase labels, dictionary dates, technology/legal annotations.

Requires real corpus extraction: exact peaks, sense-specific lines, British/American comparisons, context examples.

Strong: Gives orientation and shows twentieth-century acceleration clearly.

Risk: A single headword line flattens meaning. "Data" is too semantically broad to read directly as cultural interpretation.

### 2. Temporal Semantic Chain / Network

Data required: nodes for terms, first-attestation/first-strong-signal dates, branch categories, supporting sources, confidence levels, directed or typed edges.

Could be built with curated/manual data: initial node list and broad phase placement from dictionaries/Ngram.

Requires real corpus extraction: edge strength, collocate ranking by period, sense disambiguation.

Strong: Best fit for the word. It can show "data" radiating into evidence, processing, storage, privacy, AI.

Risk: Network edges can look more empirical than they are. Must mark curated vs computed links.

### 3. Timeline Of Compound Terms

Data required: compound terms with lexical first-use dates, Ngram threshold years, source notes, confidence.

Could be built with curated/manual data: timeline of "data processing" 1954, "database" circa 1962, "metadata" 1968, "big data" 1990s/2000s, "datafication" 2013, "training data" 2000s/2010s.

Requires real corpus extraction: comparable frequency/threshold data across terms.

Strong: Highly readable; avoids overinterpreting the headword.

Risk: "First use" and "public visibility" are different. The chart should use separate markers.

### 4. Corpus-Based Collocation Map

Data required: COHA/COCA/NOW collocates by decade or period; stopword filtering; branch tagging.

Could be built with curated/manual data: seed collocate categories and display policy.

Requires real corpus extraction: actual collocate counts, dispersion, genre/register metadata.

Strong: Closest to the existing `forever` atlas pattern; makes semantic neighbourhood visible.

Risk: Generic terms around "data" can be dull unless curated: use, information, available, analysis, collected. Needs strong filtering and interpretive grouping.

### 5. "Data As Infrastructure" Diagram

Data required: curated conceptual chain: collect -> store -> process -> analyze -> model -> predict -> decide -> govern. Each stage tied to historical terms and dates.

Could be built with curated/manual data: yes, very feasible as a first-version editorial diagram.

Requires real corpus extraction: only if stage prominence is quantitatively encoded.

Strong: Excellent conceptual direction for neutral noun-like word. It creates an explanatory page, not just a dictionary page.

Risk: If styled as a universal model, it can erase pre-digital data and non-computational uses. Include early "given facts/evidence" entry point.

### 6. Neutral/Scientific Data vs Personal/User/Privacy Data

Data required: frequency series and snippets for statistical/empirical data vs personal/user/privacy/protection/breach terms.

Could be built with curated/manual data: side-by-side branch annotations and legal milestones.

Requires real corpus extraction: robust frequency and collocation from books/news/legal sources.

Strong: Gives the page social stakes without forcing emotion onto the headword.

Risk: Book corpora undercount current privacy/news language; use NOW/news and legal sources.

### 7. Search-Like Interface Revealing Chains

Data required: curated graph of terms; each click reveals source-backed neighbouring terms and periods.

Could be built with curated/manual data: initial version with 30-50 nodes and source citations.

Requires real corpus extraction: computed edge weights and confidence scaling.

Strong: The interaction mirrors the subject: searching through data relations.

Risk: Needs disciplined source labels so users do not mistake curated exploration for exhaustive search.

## Data Source Inventory

| Source | Provides | Reliability | Limitations | Best use |
|---|---|---|---|---|
| Google Books Ngram Viewer | Long-run book-frequency series, British/American comparison, compound visibility | Useful baseline, large corpus | OCR/date/genre bias; no sense labels; books only; current endpoint to 2022 | Automated extraction + visual baseline |
| Google Ngram downloadable datasets | Replicable n-gram counts, possible deeper extraction | High for count replication | Large files; same corpus limits; processing effort | Automated extraction if needed |
| COHA | Historical American English, 1810s-2000s, genre-balanced, collocates/KWIC | Strong for American historical language | Interface/licensing constraints; may not be fully automatable | Manual annotation or licensed extraction |
| COCA | Contemporary American English, 1990-2019, balanced genres | Strong for modern collocation/register | Access constraints for bulk extraction | Manual/paid extraction |
| NOW Corpus | Web news, 2010-present | Strong for current privacy, breach, AI vocabulary | News-register only; access constraints | Manual extraction for 2010s-2026 |
| Google Books / HathiTrust / Internet Archive | Searchable books and metadata | Good for source snippets | Copyright access and OCR; manual review needed | Citation/snippet evidence |
| Project Gutenberg | Public-domain full text | Automatable and display-safe | Not representative; weak for modern data vocabulary | Early context only, likely limited for "data" |
| Etymonline | Etymology and dated sense notes | Useful secondary lexical source | Not a corpus; dates need corroboration for high-stakes claims | Citation + prehistory notes |
| Merriam-Webster | Definitions, first known use, usage guide | Reliable dictionary source | Not comprehensive historical corpus | Citation + grammar note |
| Cambridge / Britannica / Oxford Learner's | Modern usage and singular/plural notes | Reliable educational dictionaries | Limited historical depth | Citation + wording of modern senses |
| OED | Full historical quotations and first attestations | Very strong | Subscription; may not be accessible | Manual deep research if available |
| GDPR / EU legal texts | Personal data, processing, profiling definitions | Primary legal source | EU-specific | Legal/social phase annotation |
| OECD Privacy Guidelines | 1980 privacy principles and transborder data flows | Primary policy source | Policy, not lexical frequency | Timeline annotation |
| FTC reports/releases | Data broker, social media, location data enforcement | Primary US policy/regulatory source | Event-specific; US-centric | Privacy/surveillance branch |
| Britannica Big Data | Overview and history of big data term | Reliable encyclopedia | Secondary; not detailed corpus source | Big data annotation |
| Diebold paper on "Big Data" origins | Academic history of term | Strong for origin debate | Narrow focus on term | Citation for big data phase |
| Journal of Electronic Publishing metadata article | Metadata history, Bagley 1968 reference | Useful secondary source | Needs primary Bagley check for final claim | Metadata annotation |
| Stanford HAI AI Definitions | Training data definition | Reliable institutional explainer | Current definition, not historical frequency | AI phase explanation |
| JMLR T5 / C4 paper | C4 training dataset and transfer learning context | Primary academic source | Technical; one dataset lineage | AI/training-data source |
| Common Crawl | Open web corpus used in research/LLM pipelines | Primary source for web crawl data | Not itself a lexical history corpus | AI training-data context |
| The Pile paper/datasheet | Large language-model training corpus | Primary academic/source documentation | 2020-specific; not all AI training | AI phase annotation |
| Datafication academic sources | Social theory of turning life/practice into data | Strong for critical branch | Term is more academic than popular | Curated concept annotation |

Useful source links:

- COHA: https://www.english-corpora.org/coha.asp
- COCA n-grams: https://www.ngrams.info/coca.asp
- COCA collocates: https://www.collocates.info/coca.asp
- Cornell corpus overview: https://linguistics.cornell.edu/language-corpora
- Database Merriam-Webster: https://www.merriam-webster.com/dictionary/database
- Database Dictionary.com: https://www.dictionary.com/browse/database
- Britannica big data: https://www.britannica.com/technology/big-data
- Diebold, "On the Origin(s) and Development of the Term Big Data": https://economics.sas.upenn.edu/pier/working-paper/2012/origins-and-development-term-big-data
- GDPR Article 4 definitions: https://gdpr.eu/article-4-definitions/
- OECD Privacy Guidelines overview: https://www.oecd.org/en/topics/privacy-principles.html
- FTC data brokers report release: https://www.ftc.gov/news-events/press-releases/2014/05/ftc-recommends-congress-require-data-broker-industry-be-more
- Stanford HAI training data definition: https://hai.stanford.edu/ai-definitions/what-is-training-data
- JMLR T5/C4 paper: https://www.jmlr.org/papers/v21/20-074.html
- Common Crawl: https://commoncrawl.org/
- The Pile paper: https://huggingface.co/papers/2101.00027
- Datafication, Monash/Springer entry: https://research.monash.edu/en/publications/datafication/
- Van Dijck, "Datafication, dataism and dataveillance": https://ojs.library.queensu.ca/index.php/surveillance-and-society/article/view/datafication
- Metadata article: https://quod.lib.umich.edu/j/jep/3336451.0018.305?view=text;rgn=main

## Practical Implementation Notes

### Existing Project Structure

Observed files and patterns:

- Word list lives in `src/data/words.ts`. `data` already exists as `coming-soon`.
- Word pages live under `src/app/words/<slug>/page.tsx`.
- Generated data lives in `src/data/generated`.
- Data-build scripts live in `scripts`.
- `forever` uses one consolidated dataset: `src/data/generated/forever_dataset.json`, typed by `src/types/foreverRealData.ts`, and rendered by `src/components/ForeverPoster.tsx`.
- `depression` uses multiple generated files: frequency, prehistory, branches, evidence, coverage report, and semantic-machine relations, typed by `src/types/depressionData.ts` and rendered by `src/components/DepressionPoster.tsx`.
- Existing scripts already fetch Google Ngram JSON and convert values to frequency per million.

### Existing Schemas To Reuse

Reusable:

- Frequency series with `points`, `frequencyPerMillion`, `firstNonZeroYear`, `recommendedVisualStartYear`, `coverageNote`, `semanticCaveat`.
- Prehistory records with `form`, `dateLabel`, `sourceName`, `sourceUrl`, `quote`, `confidence`, `caveat`.
- Branch records with `id`, `label`, `periodOfImportance`, `supportingTerms`, `visualUse`, `caveat`.
- Evidence records with source layer, branch tag, snippet, confidence, rights state.
- Forever-style atlas/network nodes and edges, especially `dataLayer: raw | computed | curated | interpretive`.

### Likely New Schema Needed For "data"

"Data" likely needs a schema that foregrounds compound terms and semantic relations:

- `data_frequency.json`: headword and selected compound Ngram series.
- `data_terms.json`: compound-term inventory with `term`, `branch`, `firstLexicalDate`, `ngramThresholdYears`, `sourceLinks`, `confidence`, `visualRole`.
- `data_phases.json`: semantic phase model with date ranges, supporting terms, drivers, support level.
- `data_relations.json`: temporal semantic chain/network: nodes, edges, edge type, branch, start/end period, weight, data layer, evidence ids.
- `data_infrastructure.json`: curated stages: collection, storage, processing, analysis, modeling, prediction, decision, governance.
- `data_evidence.json`: manually reviewed dictionary/corpus/legal/technical snippets.
- `data_coverage_report.json`: source coverage, limitations, which branches are supported vs speculative.

### Likely Later Files

Future implementation would probably add or modify:

- `scripts/fetch_ngram_data.ts`
- `scripts/build_data_terms.ts`
- `scripts/build_data_relations.ts`
- `scripts/build_data_evidence.ts`
- `scripts/build_data_dataset.ts`
- `src/types/dataData.ts`
- `src/data/generated/data_*.json`
- `src/app/words/data/page.tsx`
- one or more components, possibly `DataPoster.tsx`, `DataSemanticChain.tsx`, `DataInfrastructureDiagram.tsx`
- `src/data/words.ts` to mark `data` complete only after the page is built

No implementation should happen until the deep research pass validates sources and finalizes the story model.

## Open Questions For Deep Research

1. Can COHA confirm the nineteenth-century contexts of "data" as statistical/scientific rather than OCR or bibliographic noise?
2. What are the top collocates of "data" by decade in COHA/COCA/NOW, and do they cluster cleanly into the proposed branches?
3. When does singular mass-noun usage ("data is") become common, and can it be measured reliably in COHA/COCA?
4. How should British/EU "data protection" be handled alongside US "privacy" language?
5. Should "metadata" be treated as a branch of data infrastructure, surveillance, bibliography, or all three?
6. Is "database" better visualized as a compound node or as a separate lexical descendant with its own line?
7. Which AI-related terms are visible enough by 2022 in books, and which require 2023-2026 news/web/academic sources?
8. Can "search data" be supported with public sources without relying on contemporary news alone?
9. How should the page distinguish "data as evidence" from "data as asset" from "data as extracted trace"?
10. What is the right public-facing uncertainty language for curated semantic edges?

## Recommended Next Deep-Research Prompt

Focus on a source-backed semantic chain for "data":

- Extract Ngram series for 30-50 candidate compounds, with threshold years and British/American comparison.
- Pull COHA/COCA collocates for "data" by decade/register where possible.
- Manually collect 20-30 short, rights-safe evidence snippets across phases.
- Validate dictionary first-use dates against OED or equivalent lexical sources if accessible.
- Build a branch taxonomy with confidence levels and explicit evidence fields.
- Decide whether the primary visual should be a temporal semantic network, an infrastructure diagram, or a hybrid of both.

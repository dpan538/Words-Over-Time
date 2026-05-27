# Privacy Research Expansion Report

Generated: 2026-05-27T03:18:32.491845Z

## What Was Collected

- Public dated evidence records: 84
- Supplemental phrase-frequency rows: 84
- Platform/policy documents: 8
- Wikipedia reference records: 11
- Legal/institutional records: 5
- News discourse rows: 110
- News attention rows: 359
- Court opinion rows: 120
- Archive metadata rows: 40
- Publication metadata rows: 80
- Academic transition rows: 218
- Academic institution rows: 20
- Failed source rows: 1
- Total rows across sections: 1139

## Source Health

- Library of Congress Chronicling America Collection (public_dated_evidence): available, 84 records
- Google Books Ngram Viewer (supplemental_phrase_frequency): available, 84 records
- Platform and regulator policy documents (platform_policy_corpus): available, 8 records
- Wikipedia REST Summary (wikipedia_reference_corpus): available, 11 records
- Legal and institutional public reference documents (legal_institutional_corpus): available, 5 records
- GDELT DOC 2.0 ArtList (news_discourse_expansion): available, 110 records
- GDELT DOC 2.0 TimelineVol (news_attention_proxy): available, 359 records
- CourtListener search (court_opinion_metadata): available, 120 records
- Internet Archive Advanced Search (archive_metadata): available, 40 records
- Crossref works (publication_metadata): available, 80 records
- OpenAlex works (academic_transition_expansion): available, 218 records
- OpenAlex institutions (academic_transition_expansion): available, 20 records

## Strong Signals

- Public dated evidence now includes collection-level historical publication metadata across multiple windows and terms.
- Supplemental phrase-frequency rows recovered legal, informational, and tension vocabulary beyond the first collocation pass.
- Real platform and regulator documents now contribute modern compliance and interface-language evidence.
- Wikipedia concept summaries now widen topical coverage across privacy, surveillance, policy, and data-governance branches.
- Public legal and institutional explanation pages now add doctrinal and governance vocabulary outside platform policies.
- A second attention-like proxy exists via GDELT news volume intensity.
- Court opinion search metadata adds a case-law discovery layer for privacy doctrines and legal phrases.
- Internet Archive discovery metadata adds bibliographic and collection-level leads outside the standard word-frequency stack.
- Crossref publication metadata adds article-, chapter-, and book-title discovery for privacy branches beyond dictionaries and news.
- Academic transition queries recovered additional institution geography with coordinates.

## Weak Signals

- LOC collection-search evidence is useful for dated-publication presence but is too noisy to treat as exact first-attestation proof.
- Some requested source windows or query variants still failed and remain candidates for targeted reruns.

## Failed Sources

- gdelt_doc_artlist (news_discourse_expansion): json-decode: Expecting value: line 1 column 1 (char 0)

## Outputs

- Raw: `docs/research/privacy/raw/privacy_research_expansion_raw.json`
- Processed: `docs/research/privacy/processed/privacy_research_expansion_processed.json`
- JSON report: `docs/research/privacy/reports/privacy_research_expansion_data_report.json`
- Markdown report: `docs/research/privacy/reports/privacy_research_expansion_data_report.md`

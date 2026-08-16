import { artificialMobileResearch as research } from "./artificialMobileResearch";

const claimText = (claims: ReadonlyArray<{ claim: string }>) =>
  claims.map(({ claim }) => ({ claim }));

export const artificialMobileProduction = {
  researchCoverage: {
    selectedTermCount: research.researchCoverage.selectedTermCount,
    retainedTermYearCellCount: research.researchCoverage.retainedTermYearCellCount,
    compoundTermCount: research.researchCoverage.compoundTermCount,
    compoundTermYearCellCount: research.researchCoverage.compoundTermYearCellCount,
    compoundYearCoverage: { ...research.researchCoverage.compoundYearCoverage },
    mediaTermCount: research.researchCoverage.mediaTermCount,
    mediaTermYearCellCount: research.researchCoverage.mediaTermYearCellCount,
    mediaYearCoverage: { ...research.researchCoverage.mediaYearCoverage },
    unit: research.researchCoverage.unit,
  },
  compoundFamily: {
    registeredArtificialPrefixTermCount: research.compoundFamily.registeredArtificialPrefixTermCount,
    domains: research.compoundFamily.domains.map(({ domain, termCount, termNames }) => ({
      domain,
      termCount,
      termNames,
    })),
  },
  mediaShift: {
    selectedTermCount: research.mediaShift.selectedTermCount,
    eras: research.mediaShift.eras.map(({ era, label, termCount, termNames }) => ({
      era,
      label,
      termCount,
      termNames,
    })),
  },
  originEvidence: {
    claimCount: research.originEvidence.claimCount,
    publicCoreClaims: claimText(research.originEvidence.publicCoreClaims),
    useWithCareClaims: claimText(research.originEvidence.useWithCareClaims),
    methodologicalBoundaryClaims: claimText(research.originEvidence.methodologicalBoundaryClaims),
    excludedClaims: claimText(research.originEvidence.excludedClaims),
  },
  phraseVocabulary: {
    exactPhraseCount: research.phraseVocabulary.exactPhraseCount,
    domains: research.phraseVocabulary.domains.map(({ domain, termCount, termNames }) => ({
      domain,
      termCount,
      termNames,
    })),
  },
  suspicionTransfer: {
    anchorCount: research.suspicionTransfer.anchorCount,
    anchors: research.suspicionTransfer.anchors.map(({ period, phrases, domain, negativeCharge, strength, source, sourceType, sourceUrl }) => ({
      period,
      phrases,
      domain,
      negativeCharge,
      strength,
      source,
      sourceType,
      sourceUrl,
    })),
  },
  semanticMobility: {
    caveat: research.semanticMobility.caveat,
    views: research.semanticMobility.views.map(({ id, relationFamily, axisLabel, title, summary, sourceName, sourceType, sourceUrl, yearOrPeriod }) => ({
      id,
      relationFamily,
      axisLabel,
      title,
      summary,
      sourceName,
      sourceType,
      sourceUrl,
      yearOrPeriod,
    })),
  },
  humanContinuation: {
    markedEvidenceRecordCount: research.humanContinuation.markedEvidenceRecordCount,
    evidenceExamples: research.humanContinuation.evidenceExamples.map((example) => ({ ...example })),
    functionGroups: research.humanContinuation.functionGroups.map((group) => ({ ...group })),
    evidenceProfile: { ...research.humanContinuation.evidenceProfile },
    layers: research.humanContinuation.layers.map(({ id, label, layerNumber, evidenceCount }) => ({
      id,
      label,
      layerNumber,
      evidenceCount,
    })),
  },
} as const;

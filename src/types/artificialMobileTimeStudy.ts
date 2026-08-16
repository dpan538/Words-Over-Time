export type ArtificialTimeTheme = "BIOLOGICAL" | "COGNITIVE" | "MATERIAL" | "SENSE" | "SOCIAL";
export type ArtificialMediaEra = "optical_apparatus" | "sound_and_cinema" | "broadcast" | "digital_simulation";

export type ArtificialMobileTimeStudy = {
  schemaVersion: "1.0.0";
  release: "googlebooks-eng-20200217";
  yearCoverage: { start: 1800; end: 2019 };
  rawSelectedTermCount: 42;
  rawTermYearCellCount: 9240;
  rawCompoundCellCount: 6600;
  rawMediaCellCount: 2640;
  comparableCompoundTermCount: 29;
  comparableCompoundCellCount: 6380;
  positiveComparableCompoundCellCount: number;
  scatter: {
    unit: "one positive bigram term-year Viewer cell";
    x: "year";
    y: "log10 corpus-normalized bigram fraction";
    points: Array<{ year: number; logFraction: number; theme: ArtificialTimeTheme }>;
    yDomain: { min: number; max: number };
  };
  compoundBands: Array<{
    startYear: number;
    endYear: number;
    totalMeanFraction: number;
    themes: Record<ArtificialTimeTheme, number>;
  }>;
  mediaBands: Array<{
    startYear: number;
    endYear: number;
    totalEqualTermIndex: number;
    eras: Record<ArtificialMediaEra, number>;
  }>;
  branchTrend: {
    unit: "share of the selected comparable bigram total, 11-year moving window";
    years: number[];
    themes: Array<{ theme: ArtificialTimeTheme; values: Array<number | null> }>;
  };
};

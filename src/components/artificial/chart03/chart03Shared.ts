export type Chart03Domain = "sight" | "sound" | "light" | "scene" | "authenticity" | "industrial";
export type Chart03Layer = "spectacle" | "apparatus" | "recording" | "broadcast" | "mass-media" | "digital";
export type Chart03Role = "spectacle" | "reproduction" | "broadcast" | "authenticity" | "simulation" | "industrial" | "transition" | "concept";

export type Chart03Hover = {
  termId?: string;
  label?: string;
  year?: number;
  domain?: Chart03Domain;
  layer?: Chart03Layer;
  role?: Chart03Role;
  lineId?: string;
  responseId?: string;
  source?: string;
};

export type Chart03HoverProps = {
  activeHover?: Chart03Hover | null;
  onHover?: (hover: Chart03Hover | null) => void;
};

export type Chart03TermMeta = Required<Omit<Chart03Hover, "source">> & {
  relatedTerms?: string[];
};

export const chart03TermIndex: Record<string, Chart03TermMeta> = {
  panorama: {
    termId: "panorama",
    label: "panorama",
    year: 1808,
    domain: "scene",
    layer: "spectacle",
    role: "spectacle",
    lineId: "spectacle",
    responseId: "imitation",
    relatedTerms: ["diorama", "stereoscope"],
  },
  diorama: {
    termId: "diorama",
    label: "diorama",
    year: 1851,
    domain: "scene",
    layer: "spectacle",
    role: "spectacle",
    lineId: "spectacle",
    responseId: "imitation",
    relatedTerms: ["panorama", "stereoscope"],
  },
  stereoscope: {
    termId: "stereoscope",
    label: "stereoscope",
    year: 1865,
    domain: "scene",
    layer: "apparatus",
    role: "transition",
    lineId: "spectacle",
    responseId: "imitation",
    relatedTerms: ["magic-lantern", "virtual-reality"],
  },
  "magic-lantern": {
    termId: "magic-lantern",
    label: "magic lantern",
    year: 1880,
    domain: "scene",
    layer: "apparatus",
    role: "transition",
    lineId: "spectacle",
    responseId: "imitation",
    relatedTerms: ["stereoscope", "cinema"],
  },
  photograph: {
    termId: "photograph",
    label: "photograph",
    year: 1868,
    domain: "sight",
    layer: "recording",
    role: "reproduction",
    lineId: "reproduction",
    responseId: "imitation",
    relatedTerms: ["photography", "photomechanical", "halftone"],
  },
  photography: {
    termId: "photography",
    label: "photography",
    year: 1851,
    domain: "sight",
    layer: "recording",
    role: "reproduction",
    lineId: "reproduction",
    responseId: "imitation",
    relatedTerms: ["photograph", "cinematograph", "halftone"],
  },
  cinematograph: {
    termId: "cinematograph",
    label: "cinematograph",
    year: 1897,
    domain: "sight",
    layer: "broadcast",
    role: "transition",
    lineId: "reproduction",
    responseId: "imitation",
    relatedTerms: ["moving-picture", "cinema"],
  },
  "moving-picture": {
    termId: "moving-picture",
    label: "moving picture",
    year: 1916,
    domain: "sight",
    layer: "broadcast",
    role: "reproduction",
    lineId: "reproduction",
    responseId: "imitation",
    relatedTerms: ["motion-picture", "cinema"],
  },
  "motion-picture": {
    termId: "motion-picture",
    label: "motion picture",
    year: 1953,
    domain: "sight",
    layer: "mass-media",
    role: "broadcast",
    lineId: "television",
    responseId: "authenticity",
    relatedTerms: ["moving-picture", "television"],
  },
  phonograph: {
    termId: "phonograph",
    label: "phonograph",
    year: 1878,
    domain: "sound",
    layer: "recording",
    role: "reproduction",
    lineId: "reproduction",
    responseId: "imitation",
    relatedTerms: ["gramophone", "recorded-music", "sound-recording"],
  },
  gramophone: {
    termId: "gramophone",
    label: "gramophone",
    year: 1932,
    domain: "sound",
    layer: "recording",
    role: "reproduction",
    lineId: "reproduction",
    responseId: "imitation",
    relatedTerms: ["phonograph", "recorded-music"],
  },
  "recorded-music": {
    termId: "recorded-music",
    label: "recorded music",
    year: 1933,
    domain: "sound",
    layer: "broadcast",
    role: "concept",
    lineId: "reproduction",
    responseId: "authenticity",
    relatedTerms: ["phonograph", "sound-recording"],
  },
  "sound-recording": {
    termId: "sound-recording",
    label: "sound recording",
    year: 1983,
    domain: "sound",
    layer: "digital",
    role: "concept",
    lineId: "authenticity",
    responseId: "authenticity",
    relatedTerms: ["recorded-music", "digital-recording"],
  },
  "high-fidelity": {
    termId: "high-fidelity",
    label: "high fidelity",
    year: 1956,
    domain: "sound",
    layer: "mass-media",
    role: "authenticity",
    lineId: "authenticity",
    responseId: "authenticity",
    relatedTerms: ["sound-recording", "recorded-music"],
  },
  "electric-light": {
    termId: "electric-light",
    label: "electric light",
    year: 1897,
    domain: "light",
    layer: "broadcast",
    role: "reproduction",
    lineId: "reproduction",
    responseId: "imitation",
    relatedTerms: ["limelight", "stage-lighting", "studio-lighting"],
  },
  limelight: {
    termId: "limelight",
    label: "limelight",
    year: 1878,
    domain: "light",
    layer: "apparatus",
    role: "transition",
    lineId: "reproduction",
    responseId: "imitation",
    relatedTerms: ["electric-light", "stage-lighting"],
  },
  "stage-lighting": {
    termId: "stage-lighting",
    label: "stage lighting",
    year: 1935,
    domain: "light",
    layer: "broadcast",
    role: "concept",
    lineId: "reproduction",
    responseId: "authenticity",
    relatedTerms: ["studio-lighting", "special-effect"],
  },
  television: {
    termId: "television",
    label: "television",
    year: 1953,
    domain: "sight",
    layer: "mass-media",
    role: "broadcast",
    lineId: "television",
    responseId: "authenticity",
    relatedTerms: ["mass-media", "broadcast"],
  },
  "digital-image": {
    termId: "digital-image",
    label: "digital image",
    year: 1999,
    domain: "sight",
    layer: "digital",
    role: "simulation",
    lineId: "authenticity",
    responseId: "simulation",
    relatedTerms: ["computer-gfx", "virtual-reality"],
  },
  "computer-gfx": {
    termId: "computer-gfx",
    label: "computer graphics",
    year: 1978,
    domain: "sight",
    layer: "digital",
    role: "simulation",
    lineId: "authenticity",
    responseId: "simulation",
    relatedTerms: ["digital-image", "simulation"],
  },
  simulation: {
    termId: "simulation",
    label: "simulation",
    year: 1995,
    domain: "scene",
    layer: "digital",
    role: "simulation",
    lineId: "authenticity",
    responseId: "simulation",
    relatedTerms: ["virtual-reality", "digital-image"],
  },
  "virtual-reality": {
    termId: "virtual-reality",
    label: "virtual reality",
    year: 2019,
    domain: "scene",
    layer: "digital",
    role: "simulation",
    lineId: "authenticity",
    responseId: "simulation",
    relatedTerms: ["stereoscope", "simulation"],
  },
  "mass-production": {
    termId: "mass-production",
    label: "mass production",
    year: 1930,
    domain: "industrial",
    layer: "broadcast",
    role: "industrial",
    lineId: "industrial",
    responseId: "authenticity",
    relatedTerms: ["photomechanical", "halftone"],
  },
  photomechanical: {
    termId: "photomechanical",
    label: "photomechanical",
    year: 1890,
    domain: "industrial",
    layer: "recording",
    role: "industrial",
    lineId: "industrial",
    responseId: "imitation",
    relatedTerms: ["photography", "halftone"],
  },
  halftone: {
    termId: "halftone",
    label: "halftone",
    year: 1895,
    domain: "industrial",
    layer: "recording",
    role: "industrial",
    lineId: "industrial",
    responseId: "imitation",
    relatedTerms: ["photomechanical", "photography"],
  },
};

export function chart03HoverForTerm(termId: string, source?: string): Chart03Hover {
  const meta = chart03TermIndex[termId];
  if (!meta) return { termId, label: termId.replace(/-/g, " "), source };
  return { ...meta, source };
}

export function chart03HoverForLayer(layer: Chart03Layer, source?: string): Chart03Hover {
  const firstTerm = Object.values(chart03TermIndex).find((term) => term.layer === layer);
  return {
    termId: firstTerm?.termId,
    label: firstTerm?.label ?? layer.replace(/-/g, " "),
    year: firstTerm?.year,
    domain: firstTerm?.domain,
    layer,
    role: firstTerm?.role,
    lineId: firstTerm?.lineId,
    responseId: firstTerm?.responseId,
    source,
  };
}

export function chart03HoverForLine(lineId: string, source?: string): Chart03Hover {
  const firstTerm = Object.values(chart03TermIndex).find((term) => term.lineId === lineId);
  return {
    termId: firstTerm?.termId,
    label: firstTerm?.label ?? lineId.replace(/-/g, " "),
    year: firstTerm?.year,
    domain: firstTerm?.domain,
    layer: firstTerm?.layer,
    role: firstTerm?.role,
    lineId,
    responseId: firstTerm?.responseId,
    source,
  };
}

export function chart03HoverForResponse(responseId: string, source?: string): Chart03Hover {
  const firstTerm = Object.values(chart03TermIndex).find((term) => term.responseId === responseId);
  return {
    termId: firstTerm?.termId,
    label: firstTerm?.label ?? responseId.replace(/-/g, " "),
    year: firstTerm?.year,
    domain: firstTerm?.domain ?? "authenticity",
    layer: firstTerm?.layer,
    role: responseId === "simulation" ? "simulation" : "authenticity",
    lineId: firstTerm?.lineId,
    responseId,
    source,
  };
}

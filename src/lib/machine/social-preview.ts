import "server-only";

import {
  CANONICAL_ORIGIN,
  canonicalAuthor,
  canonicalRouteByPath,
  canonicalSocialImageAlt,
  canonicalSocialTitle,
  type CanonicalRoutePath,
} from "./canonical-publication";

const socialPreviewAccents: Record<CanonicalRoutePath, string> = {
  "/": "#006fb6",
  "/about": "#d93621",
  "/words": "#050510",
  "/words/forever": "#f06b04",
  "/words/artificial": "#d93621",
  "/words/hub": "#0b7f86",
  "/words/privacy": "#6f3aa6",
  "/words/data": "#1570ac",
  "/words/depression": "#006fb6",
};

const socialSupportingLines: Record<CanonicalRoutePath, string> = {
  "/": "Meaning shifts. Frequencies move. Visual evidence makes the change legible.",
  "/about":
    "The method behind the words: sources, limits, transformations, citation, and rights.",
  "/words":
    "A growing research publication on how word meanings split, accumulate, and change—and what the evidence can actually support.",
  "/words/forever":
    "In these printed-book frequency records, “forever” overtakes “for ever”—a shift between written forms, not a stable definition.",
  "/words/artificial":
    "Artificial has an earlier history in art and making, with distinct branches in simulation, distrust, bodily support, and modeled human processes.",
  "/words/hub":
    "Hub travels from wheel centers into routes and networks while retaining the idea of a center and changing what gathers around it.",
  "/words/privacy":
    "Privacy extends beyond private life: institutions translate it into policies, controls, rights, and risks.",
  "/words/data":
    "Data is not simply given: collection, division, packaging, governance, and work shape what becomes usable.",
  "/words/depression":
    "Depression is one spelling across loweredness, melancholy, weather, economic crisis, and clinical diagnosis—not one settled meaning.",
};

function imageTitle(
  route: ReturnType<typeof canonicalRouteByPath>,
) {
  if (route.path === "/about") return route.machineTitle.split(",", 1)[0].toLowerCase();
  if (route.path === "/words") return route.machineTitle.split(":", 1)[0].toLowerCase();
  if (route.subject.alternateNames?.length) {
    return [route.subject.name, ...route.subject.alternateNames].join(" / ").toLowerCase();
  }
  return route.subject.name.toLowerCase();
}

function kindLabel(route: ReturnType<typeof canonicalRouteByPath>) {
  if (route.path === "/") return "research project";
  if (route.path === "/words") return "research publication";
  return route.subject.kind === "methodology" ? "methodology" : "word study";
}

export type CanonicalSocialPreview = {
  path: CanonicalRoutePath;
  title: string;
  description: string;
  imageAlt: string;
  imageTitle: string;
  imageSupportingText: string;
  eyebrow: string;
  accent: string;
  author: string;
  domain: string;
};

export function canonicalSocialPreview(
  path: CanonicalRoutePath,
): CanonicalSocialPreview {
  const route = canonicalRouteByPath(path);

  return {
    path,
    title: canonicalSocialTitle(route),
    description: route.machineDescription,
    imageAlt: canonicalSocialImageAlt(route),
    imageTitle: imageTitle(route),
    imageSupportingText: socialSupportingLines[path],
    eyebrow: `Words Over Time / ${kindLabel(route)}`,
    accent: socialPreviewAccents[path],
    author: canonicalAuthor.displayName,
    domain: new URL(CANONICAL_ORIGIN).hostname.replace(/^www\./, ""),
  };
}

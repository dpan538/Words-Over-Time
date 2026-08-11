import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

const CANONICAL_PATH =
  "docs/design/mobile/words-over-time-mobile-design-governance.md";
const AGENTS_PATH = "AGENTS.md";
const CANONICAL_SHA256 =
  "5e09babf461530b96f2fc033068e0c06aeb4a9ae46ca861dcba4af670a521e77";
const BEGIN_MARKER =
  "<!-- BEGIN WORDS_OVER_TIME_MOBILE_DESIGN_GOVERNANCE -->";
const END_MARKER =
  "<!-- END WORDS_OVER_TIME_MOBILE_DESIGN_GOVERNANCE -->";

const BINDING_PREAMBLE = `## Words Over Time mobile research edition — binding design governance

All mobile public-route, mobile component, mobile copy, mobile data-analysis, and mobile visualization work must comply with:

\`docs/design/mobile/words-over-time-mobile-design-governance.md\`

This governance is authoritative and non-negotiable unless the user explicitly changes it in a later instruction.

- Mobile is an independently art-directed research edition, not responsive desktop.
- Desktop may provide terminology, sources, and candidate findings, but not page structure, figure geometry, analytical depth, or an implementation ceiling.
- A visualization absent from desktop may still be mandatory on mobile.
- Analysis absent from desktop must still be proposed and performed for mobile when valid project data supports it.
- Mobile findings must be traced back to current data, scripts, types, provenance, denominators, and missingness. Desktop prose is not research authority.
- Published mobile word-study pages target approximately 60% primary data visualization, 30% swipeable/expandable data cards, and 10% always-visible prose by rendered vertical surface area.
- Mobile cards require touch-native horizontal swipe with an adjacent-card cue and accessible accordion expansion. Collapsed cards retain a useful statistic and microvisualization; expanded cards carry longer interpretation, method, caveat, and source detail.
- The supplied weather, health-card, annual-report, and coloured mobile-report references are reconstruction targets for geometry, density, hierarchy, proportions, and behavior. They are not loose mood-board references.
- No page implementation begins before a data-led figure/card contract, 390 px storyboard, reference mapping, and 60/30/10 audit receive explicit user approval.
- Desktop page/figure components, desktop CSS/layout, desktop narrative order, hover/inspector logic, and direct desktop visualization adaptations are prohibited in mobile implementations.
- Desktop remains read-only unless separately authorized.
- Never interpret a redesign request as minimal optimization, smallest diff, breakpoint cleanup, stacking, parity, or polish.
- Never claim visual or design acceptance on the user’s behalf.
- One lead agent owns mobile art-direction coherence. Additional agents may perform bounded audits or verification, but may not independently reinterpret the design system.`;

const requiredStatements = [
  "analytical ceiling",
  "Analysis absent from desktop must still be proposed and performed for mobile when valid project data supports it.",
  "60% primary data visualization, 30% swipeable/expandable data cards, and 10% always-visible prose",
  "touch-native horizontal swipe",
  "accessible accordion expansion",
  "No page implementation begins before a data-led figure/card contract, 390 px storyboard, reference mapping, and 60/30/10 audit receive explicit user approval.",
  "Desktop remains read-only unless separately authorized.",
];

function normalizeNewlines(value) {
  return value.replace(/\r\n/g, "\n");
}

function fail(message) {
  throw new Error(`Mobile design governance verification failed: ${message}`);
}

function markerCount(text, marker) {
  return text.split(marker).length - 1;
}

async function readRequiredFile(filePath, label) {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    fail(`${label} is missing or unreadable at ${filePath}: ${detail}`);
  }
}

const repositoryRoot = process.cwd();
const canonicalFile = path.join(repositoryRoot, CANONICAL_PATH);
const agentsFile = path.join(repositoryRoot, AGENTS_PATH);

const canonicalRaw = await readRequiredFile(
  canonicalFile,
  "Canonical mobile governance document",
);
const agentsRaw = await readRequiredFile(
  agentsFile,
  "Repository-root governing AGENTS.md",
);

const canonical = normalizeNewlines(canonicalRaw);
const agents = normalizeNewlines(agentsRaw);
const canonicalSha256 = createHash("sha256")
  .update(canonical)
  .digest("hex");

if (canonicalSha256 !== CANONICAL_SHA256) {
  fail(
    `canonical document hash drifted: expected ${CANONICAL_SHA256}, received ${canonicalSha256}`,
  );
}

if (!agents.includes(CANONICAL_PATH)) {
  fail(`AGENTS.md does not name the canonical path ${CANONICAL_PATH}`);
}

if (!agents.includes("does not govern desktop art direction")) {
  fail(
    "repository-root AGENTS.md does not state that the mobile block excludes desktop art direction",
  );
}

if (markerCount(agents, BEGIN_MARKER) !== 1) {
  fail(`AGENTS.md must contain exactly one ${BEGIN_MARKER}`);
}

if (markerCount(agents, END_MARKER) !== 1) {
  fail(`AGENTS.md must contain exactly one ${END_MARKER}`);
}

const beginIndex = agents.indexOf(BEGIN_MARKER);
const endIndex = agents.indexOf(END_MARKER);

if (endIndex <= beginIndex) {
  fail("the END marker must follow the BEGIN marker");
}

const installedBlock = agents
  .slice(beginIndex + BEGIN_MARKER.length, endIndex)
  .replace(/^\n+/, "")
  .replace(/\n+$/, "");
const expectedBlock = `${BINDING_PREAMBLE}\n\n${canonical.replace(/\n+$/, "")}`;

if (installedBlock !== expectedBlock) {
  fail(
    "the marked AGENTS.md block has drifted from the binding preamble plus the complete canonical document",
  );
}

for (const statement of requiredStatements) {
  if (!installedBlock.includes(statement)) {
    fail(`required operative statement is missing: ${statement}`);
  }
}

console.log(
  JSON.stringify(
    {
      status: "PASS",
      canonicalPath: CANONICAL_PATH,
      canonicalSha256,
      governingAgentsPath: AGENTS_PATH,
      markers: {
        begin: BEGIN_MARKER,
        end: END_MARKER,
      },
      scope:
        "mobile public routes, mobile-only components/styles, mobile copy, mobile data analysis, mobile visualization, and mobile verification; desktop art direction excluded",
      visualQualityVerified: false,
    },
    null,
    2,
  ),
);

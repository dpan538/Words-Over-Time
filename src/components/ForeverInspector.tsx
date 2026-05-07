"use client";

import type { InspectorEntry } from "@/types/inspector";

type ForeverInspectorProps = {
  entry?: InspectorEntry;
  pinned: boolean;
  onClear: () => void;
};

function DataList({ title, rows }: { title: string; rows: InspectorEntry["rawInputs"] }) {
  if (!rows.length) return null;

  return (
    <div className="border-t border-wheat/18 pt-4">
      <h4 className="font-mono text-[0.62rem] font-black uppercase tracking-[0.18em] text-sun">
        {title}
      </h4>
      <dl className="mt-3 grid gap-3">
        {rows.map((row) => (
          <div key={`${row.label}-${row.value}`}>
            <dt className="font-mono text-[0.62rem] font-black uppercase tracking-[0.14em] text-wheat/44">
              {row.label}
            </dt>
            <dd className="mt-1 text-sm font-black leading-5 text-wheat">
              {row.value}
              {row.detail ? (
                <span className="block pt-1 text-xs font-bold leading-5 text-wheat/55">
                  {row.detail}
                </span>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function SummaryField({ label, value }: { label: string; value?: string | number }) {
  if (value === undefined || value === "") return null;

  return (
    <div>
      <dt className="font-mono text-[0.58rem] font-black uppercase tracking-[0.14em] text-wheat/42">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-black leading-5 text-wheat">{value}</dd>
    </div>
  );
}

export function ForeverInspector({ entry, pinned, onClear }: ForeverInspectorProps) {
  return (
    <aside className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-auto border border-ink bg-ink p-4 text-wheat shadow-[8px_8px_0_#F06B04] lg:p-5">
      <div className="flex items-start justify-between gap-4">
        <p className="font-mono text-[0.62rem] font-black uppercase tracking-[0.18em] text-sun">
          {pinned ? "pinned inspector" : "hover inspector"}
        </p>
        {entry ? (
          <button
            type="button"
            onClick={onClear}
            className="border border-wheat/40 px-2 py-1 font-mono text-[0.62rem] font-black uppercase tracking-[0.14em] transition hover:border-sun hover:text-sun"
          >
            clear
          </button>
        ) : null}
      </div>

      {entry ? (
        <div className="mt-5 grid gap-5">
          <div>
            <h3 className="text-[clamp(1.8rem,3vw,3.4rem)] font-black leading-[0.9] text-blaze">
              {entry.title}
            </h3>
            <p className="mt-3 font-mono text-[0.68rem] font-black uppercase leading-5 tracking-[0.16em] text-wheat/58">
              {entry.visualType} / {entry.elementType} / {entry.period}
            </p>
          </div>

          <p className="text-sm font-bold leading-6 text-wheat/75">{entry.explanation}</p>

          <div className="border-t border-wheat/18 pt-4">
            <h4 className="font-mono text-[0.62rem] font-black uppercase tracking-[0.18em] text-sun">
              method summary
            </h4>
            <dl className="mt-3 grid grid-cols-2 gap-3">
              <SummaryField label="data layer" value={entry.dataLayer} />
              <SummaryField label="evidence count" value={entry.evidenceCount} />
              <SummaryField label="document frequency" value={entry.documentFrequency} />
              <SummaryField label="score type" value={entry.scoreType} />
              <SummaryField label="score value" value={entry.scoreValue} />
              <SummaryField label="source corpus" value={entry.sourceCorpus} />
              <SummaryField label="coverage" value={entry.coverageRange} />
              <SummaryField
                label="related snippets"
                value={entry.relatedSnippetIds.length || "none"}
              />
            </dl>
            <p className="mt-3 text-sm font-bold leading-6 text-wheat/64">
              {entry.selectionReason}
            </p>
          </div>

          <DataList title="1 / raw data" rows={entry.rawInputs} />
          <DataList title="2 / computed data" rows={entry.derivedValues} />
          <DataList title="3 / curated decision" rows={entry.curatedDecisions} />

          <div className="border-t border-wheat/18 pt-4">
            <h4 className="font-mono text-[0.62rem] font-black uppercase tracking-[0.18em] text-sun">
              4 / visual mapping
            </h4>
            <p className="mt-3 text-sm font-bold leading-6 text-wheat/70">
              {entry.visualMapping}
            </p>
          </div>

          <div className="border-t border-wheat/18 pt-4">
            <h4 className="font-mono text-[0.62rem] font-black uppercase tracking-[0.18em] text-sun">
              5 / source / provenance
            </h4>
            <div className="mt-3 grid gap-2">
              {entry.sources.map((source) => (
                <p key={`${source.label}-${source.url}`} className="text-sm font-bold leading-5 text-wheat/70">
                  {source.url ? (
                    <a href={source.url} className="border-b border-wheat/35 hover:border-sun hover:text-sun">
                      {source.label}
                    </a>
                  ) : (
                    source.label
                  )}
                  {source.dateRange ? ` / ${source.dateRange}` : ""}
                  {source.rightsStatus ? ` / ${source.rightsStatus}` : ""}
                </p>
              ))}
            </div>
          </div>

          <div className="border-t border-wheat/18 pt-4">
            <h4 className="font-mono text-[0.62rem] font-black uppercase tracking-[0.18em] text-sun">
              6 / caveats
            </h4>
            <ul className="mt-3 grid gap-2">
              {entry.caveats.map((caveat) => (
                <li key={caveat} className="text-sm font-bold leading-5 text-wheat/64">
                  {caveat}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <h3 className="text-3xl font-black leading-none text-blaze">click a mark</h3>
          <p className="mt-4 text-sm font-bold leading-6 text-wheat/70">
            Hover for a light preview. Click a line, ribbon, stream band, node,
            evidence band, node, or evidence mark to pin how that element is built from raw data,
            calculations, visual mapping, and source caveats.
          </p>
        </div>
      )}
    </aside>
  );
}

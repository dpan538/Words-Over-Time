"use client";

type PanelProgressPanel = {
  num: string;
  label: string;
  color: string;
};

type PanelProgressProps = {
  panels: PanelProgressPanel[];
};

export function PanelProgress({ panels }: PanelProgressProps) {
  return (
    <div className="flex items-start gap-0 border-b border-ink/14 pb-4 pt-6">
      {panels.map((panel, index) => (
        <div key={panel.num} className="flex flex-1 items-start gap-0">
          <div className="flex min-w-0 flex-col items-start gap-1.5">
            <div
              className="h-1.5 w-1.5 rounded-full border border-ink/30"
              style={{ backgroundColor: panel.color }}
            />
            <p className="font-mono text-[0.72rem] font-black uppercase leading-5 tracking-[0.14em] text-ink/46">
              {panel.num}
            </p>
            <p className="hidden max-w-[10rem] text-left text-[1.1rem] font-bold leading-6 text-ink/62 sm:block">
              {panel.label}
            </p>
          </div>
          {index < panels.length - 1 ? (
            <div className="mx-2 mt-[2.5px] flex-1 border-t border-dashed border-ink/18" />
          ) : null}
        </div>
      ))}
    </div>
  );
}

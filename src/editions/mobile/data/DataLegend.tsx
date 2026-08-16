type LegendItem = {
  label: string;
  color: string;
  detail?: string;
};

type DataLegendProps = {
  items: LegendItem[];
  tone?: "light" | "dark";
};

export function DataLegend({ items, tone = "dark" }: DataLegendProps) {
  const textTone = tone === "light" ? "text-wheat/72" : "text-ink/62";
  const borderTone = tone === "light" ? "border-wheat/20" : "border-ink/18";

  return (
    <div className={`flex flex-wrap gap-x-4 gap-y-2 border-t ${borderTone} pt-4`}>
      {items.map((item) => (
        <div
          key={item.label}
          className={`flex items-center gap-2 font-mono text-[0.65rem] font-black uppercase leading-4 tracking-[0.14em] ${textTone}`}
        >
          <span
            className="h-2.5 w-2.5 shrink-0 border border-ink/30"
            style={{ backgroundColor: item.color }}
          />
          <span>{item.label}</span>
          {item.detail ? <span className="opacity-55">/{item.detail}</span> : null}
        </div>
      ))}
    </div>
  );
}

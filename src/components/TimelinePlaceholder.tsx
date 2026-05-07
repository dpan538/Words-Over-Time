const timelineLabels = [
  "early record",
  "slow persistence",
  "possible rise",
  "recent layer",
];

export function TimelinePlaceholder() {
  return (
    <section className="border border-wheat/25 bg-ink p-5 text-wheat sm:p-7">
      <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sun">
            timeline visual placeholder
          </p>
          <h2 className="mt-2 text-3xl font-black leading-none sm:text-5xl">
            1700 / 1800 - 2026
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-wheat/70">
          A static mock frequency path for layout and annotation testing.
        </p>
      </div>

      <div className="relative min-h-[260px] overflow-hidden border border-wheat/20 bg-wheat/[0.04] p-4">
        <div className="absolute inset-x-4 top-1/4 border-t border-wheat/10" />
        <div className="absolute inset-x-4 top-1/2 border-t border-wheat/10" />
        <div className="absolute inset-x-4 top-3/4 border-t border-wheat/10" />
        <svg
          viewBox="0 0 900 260"
          className="relative z-10 h-[220px] w-full"
          role="img"
          aria-label="Placeholder frequency line chart for the word forever"
        >
          <polyline
            points="20,205 150,198 260,190 385,180 505,152 615,130 720,95 880,58"
            fill="none"
            stroke="#F06B04"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="12"
          />
          <polyline
            points="20,218 150,211 260,203 385,193 505,165 615,143 720,108 880,71"
            fill="none"
            stroke="#A1081F"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
          />
          {[20, 260, 505, 720, 880].map((x, index) => (
            <circle
              key={x}
              cx={x}
              cy={[205, 190, 152, 95, 58][index]}
              r="8"
              fill="#FBB728"
              stroke="#050510"
              strokeWidth="3"
            />
          ))}
        </svg>
        <div className="grid grid-cols-2 gap-3 text-xs font-bold uppercase tracking-[0.14em] text-wheat/70 sm:grid-cols-4">
          {timelineLabels.map((label) => (
            <span key={label} className="border-t border-wheat/20 pt-2">
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

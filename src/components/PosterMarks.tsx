const tiles = [
  "bg-blaze",
  "bg-nice",
  "bg-wine",
  "bg-sun",
  "bg-ink",
  "bg-curious",
  "bg-fire",
  "bg-wheat border border-ink",
  "bg-sail",
  "bg-blaze",
  "bg-ink",
  "bg-sun",
  "bg-nice",
  "bg-hub-amethyst",
  "bg-hub-teal",
  "bg-hub-lime",
  "bg-hub-ruby",
  "bg-hub-blue",
  "bg-hub-pearly",
  "bg-hub-space",
];

export function PosterMarks() {
  return (
    <aside
      aria-label="Words Over Time palette"
      className="hidden w-8 self-stretch justify-self-end lg:flex xl:w-10"
    >
      <div className="flex w-full flex-col justify-center gap-4">
        <div className="h-10 border-t-[3px] border-ink" />
        <div className="grid grid-cols-1 gap-2">
          {tiles.map((tile, index) => (
            <span key={`${tile}-${index}`} className={`h-5 ${tile}`} />
          ))}
        </div>
        <p className="[writing-mode:vertical-rl] text-[0.72rem] font-black uppercase leading-none tracking-[0.16em] text-ink/60">
          palette / system
        </p>
        <div className="h-10 border-b-[3px] border-ink" />
      </div>
    </aside>
  );
}

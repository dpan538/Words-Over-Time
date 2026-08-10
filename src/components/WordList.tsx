import { WordCard } from "@/components/WordCard";
import type { Word } from "@/types/word";

type WordListProps = {
  words: Word[];
};

export function WordList({ words }: WordListProps) {
  const bySlug = new Map(words.map((word) => [word.slug, word]));
  const row = (slugs: string[]) => slugs.map((slug) => bySlug.get(slug)).filter((word): word is Word => Boolean(word));

  const rowClass: Record<string, string> = {
    forever: "grid min-h-[14.5rem] grid-cols-6 content-start overflow-clip pt-7",
    artificial: "grid min-h-[17.5rem] grid-cols-6 content-center overflow-clip",
    privacy: "grid min-h-[12.5rem] grid-cols-6 content-end overflow-clip",
    hub: "grid min-h-[24rem] grid-cols-6 content-center overflow-clip",
    depression: "grid min-h-[12.5rem] grid-cols-6 content-center overflow-clip",
    intelligence: "grid min-h-[13.5rem] grid-cols-6 content-center overflow-clip",
    data: "grid min-h-[18rem] grid-cols-6 content-center overflow-clip pb-8",
  };

  const itemClass: Record<string, string> = {
    forever: "col-span-6 text-[clamp(6rem,24vw,7rem)] font-extrabold",
    artificial: "col-span-6 col-start-2 text-[clamp(4.3rem,19vw,5.5rem)] font-semibold",
    privacy: "col-span-6 justify-end text-[clamp(4.7rem,20vw,5.7rem)] font-semibold",
    hub: "col-span-3 col-start-2 h-[21rem] justify-center self-center text-[clamp(6.7rem,32vw,8.5rem)] font-extrabold [text-orientation:mixed] [writing-mode:vertical-rl]",
    depression: "col-span-6 text-[clamp(3.7rem,17vw,4.8rem)] font-semibold",
    intelligence: "col-span-6 text-[clamp(3.3rem,15vw,4.25rem)] font-semibold",
    data: "col-span-6 text-[clamp(8rem,39vw,10.5rem)] font-extrabold",
  };

  const labelTone: Record<string, string> = {
    forever: "text-fire",
    artificial: "text-wine",
    privacy: "text-privacy-violet",
    hub: "text-hub-space",
    depression: "text-nice",
    intelligence: "text-ink",
    data: "text-nice",
  };

  const acts = [
    [row(["forever"]), row(["artificial"])],
    [row(["privacy"]), row(["hub"])],
    [row(["depression"]), row(["intelligence"]), row(["data"])],
  ].map((act) => act.filter((actRow) => actRow.length > 0));

  return (
    <div className="w-full min-w-0 max-w-[1580px] tracking-normal min-[960px]:text-[clamp(3.9rem,10.8vw,11rem)] min-[960px]:font-black min-[960px]:leading-[1.06]">
      {acts.map((act, actIndex) => (
        <section key={actIndex} aria-label={`Word field act ${actIndex + 1}`} className="min-w-0 min-[960px]:contents">
          {act.map((actRow) => (
            <div
              key={actRow.map((word) => word.slug).join("-")}
              className={`${rowClass[actRow.map((word) => word.slug).join("-")] ?? "grid grid-cols-6"} min-w-0 min-[960px]:block min-[960px]:min-h-0 min-[960px]:overflow-visible min-[960px]:whitespace-nowrap min-[960px]:pb-0 min-[960px]:pt-0`}
            >
              {actRow.map((word) => (
                <div
                  key={word.slug}
                  data-home-word={word.slug}
                  className={`${itemClass[word.slug] ?? "col-span-6"} ${labelTone[word.slug] ?? "text-ink"} ${word.status === "coming-soon" ? "flex-wrap" : "flex-nowrap"} flex min-w-0 items-baseline leading-[0.86] min-[960px]:inline-block min-[960px]:text-[1em] min-[960px]:leading-[inherit] min-[960px]:text-ink min-[960px]:whitespace-nowrap`}
                >
                  <WordCard word={word} />
                  <span aria-hidden="true" className="ml-[0.025em] text-[1em] font-normal leading-none text-current min-[960px]:mx-[0.08em] min-[960px]:text-[1em] min-[960px]:font-black min-[960px]:leading-[inherit] min-[960px]:text-ink">
                    /
                  </span>
                  {word.status === "coming-soon" ? (
                    <span className="mb-1 mt-1 w-full pl-1 font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em] text-fire min-[960px]:hidden">
                      (coming soon)
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

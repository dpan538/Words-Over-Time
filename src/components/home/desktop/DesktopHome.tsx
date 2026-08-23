import { Nav } from "@/components/Nav";
import { PosterMarks } from "@/components/PosterMarks";
import { WordList } from "@/components/WordList";
import { words } from "@/data/words";
import styles from "./desktop-home.module.css";

export function DesktopHome() {
  return (
    <div
      className={`${styles.root} min-h-screen flex-col bg-wheat px-5 py-5 text-ink sm:px-10 sm:py-7 lg:px-16 xl:px-20`}
      data-home-edition="desktop"
    >
      <Nav />
      <section className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[minmax(0,1fr)_250px] xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex flex-col gap-4 sm:gap-7">
          <p className="text-base font-black uppercase tracking-[0.18em] text-nice sm:text-xl">
            words you wanna know:
          </p>
          <WordList words={words} />
          <p className="text-base font-black uppercase tracking-[0.18em] text-fire sm:text-xl">
            over time
          </p>
          <p className="max-w-3xl border-t border-ink/24 pt-4 font-mono text-[0.78rem] font-black uppercase leading-5 tracking-[0.12em] text-ink/58 sm:text-[0.9rem]">
            Semantic change / word frequency / search statistics / design
            research / infographic art by Dai Pan / 潘岱.
          </p>
        </div>
        <PosterMarks />
      </section>
      <p className="border-t border-ink/18 pt-3 font-mono text-[0.68rem] font-black uppercase leading-4 tracking-[0.16em] text-ink/34 sm:text-[0.72rem]">
        Words Over Time: semantic change and word usage over time
      </p>
    </div>
  );
}

import { Nav } from "@/components/Nav";
import { PosterMarks } from "@/components/PosterMarks";
import { WordList } from "@/components/WordList";
import { words } from "@/data/words";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-wheat px-5 py-5 text-ink sm:px-10 sm:py-7 lg:px-16 xl:px-20">
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
        </div>
        <PosterMarks />
      </section>
    </main>
  );
}

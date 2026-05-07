import { Nav } from "@/components/Nav";
import { WordList } from "@/components/WordList";
import { words } from "@/data/words";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-wheat px-5 py-5 text-ink sm:px-8 sm:py-7">
      <Nav />
      <section className="flex flex-1 flex-col justify-center gap-4 py-16 sm:gap-7">
        <p className="text-base font-black uppercase tracking-[0.18em] text-nice sm:text-xl">
          words you wanna know:
        </p>
        <WordList words={words} />
        <p className="text-base font-black uppercase tracking-[0.18em] text-fire sm:text-xl">
          over time
        </p>
      </section>
    </main>
  );
}

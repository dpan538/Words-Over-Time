import { JsonLd } from "@/components/JsonLd";
import { Nav } from "@/components/Nav";
import { PosterMarks } from "@/components/PosterMarks";
import { WordList } from "@/components/WordList";
import { words } from "@/data/words";
import { createPageMetadata, homeJsonLd } from "@/lib/site";

export const metadata = createPageMetadata("/");

export default function Home() {
  return (
    <main
      aria-labelledby="home-title"
      className="flex min-h-screen min-w-0 flex-col bg-paper-mobile px-5 py-5 text-ink min-[960px]:bg-wheat min-[960px]:px-16 min-[960px]:py-7 xl:px-20"
    >
      <JsonLd data={homeJsonLd} />
      <Nav />
      <section className="grid min-w-0 flex-1 py-8 min-[960px]:grid-cols-[minmax(0,1fr)_250px] min-[960px]:items-center min-[960px]:gap-10 min-[960px]:py-16 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col min-[960px]:gap-12">
          <header className="hidden gap-5 border-y-2 border-ink py-6 min-[960px]:grid min-[960px]:grid-cols-[minmax(0,0.82fr)_minmax(18rem,0.48fr)] min-[960px]:items-end min-[960px]:gap-10">
            <div className="min-w-0">
              <p className="font-mono text-[0.72rem] font-black uppercase tracking-[0.16em] text-nice sm:text-[0.82rem] sm:tracking-[0.2em]">
                Source-led visual word studies
              </p>
              <h1
                id="home-title"
                className="mt-3 text-[clamp(3rem,15.5vw,5rem)] font-black leading-[0.82] tracking-[-0.045em] sm:text-[clamp(4.5rem,12vw,7.5rem)] lg:text-[clamp(4rem,7.4vw,8.4rem)]"
              >
                Words
                <span className="block text-fire">Over Time</span>
              </h1>
            </div>
            <div className="border-t border-ink/30 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <p className="text-base font-black leading-[1.22] sm:text-lg">
                Historical word frequency, lexical evidence, form variation,
                semantic change, and source-bounded interpretation.
              </p>
              <p className="mt-3 font-mono text-[0.72rem] font-bold uppercase leading-5 tracking-[0.08em] text-ink/60 sm:text-[0.78rem]">
                Not a dictionary: each study keeps provenance, uncertainty,
                rights, and claim limits visible beside the research.
              </p>
            </div>
          </header>

          <div className="min-w-0">
            <h1 className="mb-5 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ink/62 min-[960px]:hidden">
              Words you wanna know:
            </h1>
            <p className="mb-3 hidden text-sm font-black uppercase tracking-[0.16em] text-nice min-[960px]:block min-[960px]:text-base min-[960px]:tracking-[0.18em]">
              Available word studies
            </p>
            <WordList words={words} />
          </div>

          <p className="mt-16 max-w-4xl border-t border-ink/[0.24] pt-4 font-mono text-[0.68rem] font-medium uppercase leading-5 tracking-[0.07em] text-ink/55 min-[960px]:mt-0 min-[960px]:text-[0.9rem] min-[960px]:font-black min-[960px]:tracking-[0.12em]">
            Semantic change / word frequency / search statistics / design
            research / infographic art by Dai Pan / 潘岱.
          </p>
        </div>
        <PosterMarks />
      </section>
    </main>
  );
}

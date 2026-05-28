import Link from "next/link";
import { routeByPath, wordRoutes, type SiteRoute } from "@/lib/site";

type WordSeoSummaryProps = {
  path: string;
};

export function WordSeoSummary({ path }: WordSeoSummaryProps) {
  const route = routeByPath(path);

  if (!route) {
    return null;
  }

  const relatedRoutes = (route.related || [])
    .map((relatedPath) => routeByPath(relatedPath))
    .filter((relatedRoute): relatedRoute is SiteRoute => Boolean(relatedRoute));
  const otherRoutes = wordRoutes.filter((wordRoute) => wordRoute.path !== route.path);

  return (
    <section className="bg-wheat px-5 py-10 text-ink sm:px-10 lg:px-16 xl:px-20" aria-labelledby={`${route.path.slice(1).replaceAll("/", "-")}-summary`}>
      <div className="mx-auto grid max-w-[1680px] gap-6 border-t-4 border-ink pt-7 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.45fr)]">
        <div className="max-w-4xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-nice">search summary / quick read</p>
          <h2 id={`${route.path.slice(1).replaceAll("/", "-")}-summary`} className="mt-3 text-3xl font-black leading-none sm:text-5xl">
            About {route.title.toLowerCase()}/
          </h2>
          <p className="mt-4 text-lg font-bold leading-snug text-anthracite sm:text-2xl">{route.summary || route.description}</p>
          <p className="mt-4 max-w-3xl text-sm font-semibold leading-relaxed text-ink/72 sm:text-base">
            This public page is the canonical entry for the {route.title.toLowerCase()} word study. For source boundaries, copyright notes, and the
            raw-data publication policy, use the methodology and rights page.
          </p>
          <Link
            href="/about"
            className="mt-5 inline-flex w-fit border-2 border-ink px-3 py-2 text-xs font-black uppercase tracking-[0.16em] transition hover:bg-ink hover:text-wheat"
          >
            Methodology and rights
          </Link>
        </div>
        <nav aria-label={`Related word studies for ${route.title}`} className="flex flex-col justify-between gap-5 border-l-0 border-ink lg:border-l-2 lg:pl-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-fire">related studies</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(relatedRoutes.length > 0 ? relatedRoutes : otherRoutes.slice(0, 3)).map((relatedRoute) => (
                <Link
                  key={relatedRoute.path}
                  href={relatedRoute.path}
                  className="border-2 border-ink bg-[#fff8e6] px-3 py-2 text-sm font-black uppercase tracking-[0.08em] transition hover:-translate-y-0.5 hover:bg-ink hover:text-wheat"
                >
                  {relatedRoute.title}/
                </Link>
              ))}
            </div>
          </div>
          <Link href="/words" className="text-sm font-black uppercase tracking-[0.16em] text-nice underline decoration-2 underline-offset-4 hover:text-wine">
            Browse all word studies
          </Link>
        </nav>
      </div>
    </section>
  );
}

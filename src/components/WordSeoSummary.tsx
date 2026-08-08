import Link from "next/link";
import { CitationAndSharing } from "@/components/CitationAndSharing";
import { absoluteUrl, routeByPath, siteConfig, wordRoutes, type SiteRoute } from "@/lib/site";

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
  const citation = `Pan, Dai. “${route.title}.” Words Over Time, 2026. ${absoluteUrl(route.path)}. Project DOI: https://doi.org/10.5281/zenodo.20437678.`;

  return (
    <section className="bg-wheat px-5 py-8 text-ink sm:px-10 lg:px-16 xl:px-20" aria-labelledby={`${route.path.slice(1).replaceAll("/", "-")}-summary`}>
      <div className="mx-auto grid max-w-[1680px] gap-6 border-t border-ink/[0.55] pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.38fr)]">
        <div className="max-w-4xl">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-nice/90">canonical study / citation</p>
          <h2 id={`${route.path.slice(1).replaceAll("/", "-")}-summary`} className="mt-3 text-2xl font-extrabold leading-tight sm:text-4xl">
            Cite and continue this study/
          </h2>
          <p className="mt-3 max-w-3xl text-sm font-medium leading-relaxed text-ink/70 sm:text-[0.95rem]">
            This public URL is the canonical entry for the {route.title.toLowerCase()} study. The DOI identifies the project archive, not a separate
            route-level dataset. Source boundaries, rights, and the raw-data publication policy remain on the methodology page.
          </p>
          <Link
            href="/about"
            className="mt-4 inline-flex min-h-11 w-fit items-center border-b border-ink/70 pb-1 text-[0.72rem] font-black uppercase tracking-[0.15em] text-ink/80 transition hover:border-wine hover:text-wine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-ink"
          >
            Methodology and rights
          </Link>
          <div className="mt-6">
            <CitationAndSharing canonicalUrl={absoluteUrl(route.path)} citation={citation} title={`${route.title} | ${siteConfig.name}`} />
          </div>
        </div>
        <nav aria-label={`Related word studies for ${route.title}`} className="flex flex-col justify-between gap-5 border-l-0 border-ink/[0.35] lg:border-l lg:pl-6">
          <div>
            <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-fire/90">related studies</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(relatedRoutes.length > 0 ? relatedRoutes : otherRoutes.slice(0, 3)).map((relatedRoute) => (
                <Link
                  key={relatedRoute.path}
                  href={relatedRoute.path}
                  className="inline-flex min-h-11 items-center border border-ink/75 bg-transparent px-2.5 py-2 text-xs font-black uppercase tracking-[0.08em] text-ink/[0.85] transition hover:-translate-y-0.5 hover:border-ink hover:bg-ink hover:text-wheat focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-ink motion-reduce:transform-none motion-reduce:transition-none"
                >
                  {relatedRoute.title}/
                </Link>
              ))}
            </div>
          </div>
          <Link href="/words" className="inline-flex min-h-11 items-center text-xs font-black uppercase tracking-[0.15em] text-nice underline decoration-1 underline-offset-4 hover:text-wine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-ink">
            Browse all word studies
          </Link>
        </nav>
      </div>
    </section>
  );
}

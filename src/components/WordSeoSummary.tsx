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
    <section className="bg-paper-mobile px-5 py-14 text-ink min-[960px]:bg-wheat min-[960px]:px-16 min-[960px]:py-8 xl:px-20" aria-labelledby={`${route.path.slice(1).replaceAll("/", "-")}-summary`}>
      <div className="mx-auto grid max-w-[1680px] gap-10 border-t border-ink/[0.55] pt-6 min-[960px]:grid-cols-[minmax(0,1fr)_minmax(300px,0.38fr)] min-[960px]:gap-6">
        <div className="min-w-0 max-w-4xl">
          <p className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-nice/90 min-[960px]:text-[0.72rem] min-[960px]:font-black min-[960px]:tracking-[0.18em]">canonical study / citation</p>
          <h2 id={`${route.path.slice(1).replaceAll("/", "-")}-summary`} className="mt-3 text-[1.75rem] font-bold leading-tight min-[960px]:text-4xl min-[960px]:font-extrabold">
            Cite and continue this study/
          </h2>
          <p className="mt-4 max-w-3xl text-sm font-normal leading-relaxed text-ink/66 min-[960px]:mt-3 min-[960px]:text-[0.95rem] min-[960px]:font-medium min-[960px]:text-ink/70">
            This public URL is the canonical entry for the {route.title.toLowerCase()} study. The DOI identifies the project archive, not a separate
            route-level dataset. Source boundaries, rights, and the raw-data publication policy remain on the methodology page.
          </p>
          <Link
            href="/about"
            className="mt-4 inline-flex min-h-11 w-fit items-center border-b border-ink/70 pb-1 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.08em] text-ink/70 transition hover:border-wine hover:text-wine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-ink min-[960px]:text-[0.72rem] min-[960px]:font-black min-[960px]:tracking-[0.15em] min-[960px]:text-ink/80"
          >
            Methodology and rights
          </Link>
          <div className="mt-6">
            <CitationAndSharing canonicalUrl={absoluteUrl(route.path)} citation={citation} title={`${route.title} | ${siteConfig.name}`} />
          </div>
        </div>
        <nav aria-label={`Related word studies for ${route.title}`} className="flex min-w-0 flex-col justify-between gap-5 border-ink/[0.35] min-[960px]:border-l min-[960px]:pl-6">
          <div>
            <p className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-fire/90 min-[960px]:text-[0.72rem] min-[960px]:font-black min-[960px]:tracking-[0.18em]">related studies</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 min-[960px]:gap-2">
              {(relatedRoutes.length > 0 ? relatedRoutes : otherRoutes.slice(0, 3)).map((relatedRoute) => (
                <Link
                  key={relatedRoute.path}
                  href={relatedRoute.path}
                  className="inline-flex min-h-11 items-center border-b border-ink/55 bg-transparent py-2 text-xs font-semibold uppercase tracking-[0.06em] text-ink/72 transition hover:border-ink hover:text-wine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-ink min-[960px]:border min-[960px]:border-ink/75 min-[960px]:px-2.5 min-[960px]:font-black min-[960px]:tracking-[0.08em] min-[960px]:text-ink/[0.85] min-[960px]:hover:-translate-y-0.5 min-[960px]:hover:bg-ink min-[960px]:hover:text-wheat motion-reduce:transform-none motion-reduce:transition-none"
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

import Link from "next/link";
import { routeByPath, wordRoutes, type SiteRoute } from "@/lib/site";

type DesktopWordSeoSummaryProps = {
  path: string;
};

export function DesktopWordSeoSummary({ path }: DesktopWordSeoSummaryProps) {
  const route = routeByPath(path);

  if (!route) {
    return null;
  }

  const relatedRoutes = (route.related || [])
    .map((relatedPath) => routeByPath(relatedPath))
    .filter((relatedRoute): relatedRoute is SiteRoute => Boolean(relatedRoute));
  const otherRoutes = wordRoutes.filter((wordRoute) => wordRoute.path !== route.path);

  return (
    <section
      className="bg-wheat px-5 py-8 text-ink sm:px-10 lg:px-16 xl:px-20"
      aria-labelledby={`${route.path.slice(1).replaceAll("/", "-")}-summary`}
    >
      <div className="mx-auto grid max-w-[1680px] gap-6 border-t border-ink/55 pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.38fr)]">
        <div className="max-w-4xl">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-nice/90">
            search summary / quick read
          </p>
          <h2
            id={`${route.path.slice(1).replaceAll("/", "-")}-summary`}
            className="mt-3 text-2xl font-extrabold leading-tight sm:text-4xl"
          >
            About {route.title.toLowerCase()}/
          </h2>
          <p className="mt-3 max-w-4xl text-base font-semibold leading-snug text-anthracite/90 sm:text-xl">
            {route.summary || route.description}
          </p>
          <p className="mt-3 max-w-3xl text-sm font-medium leading-relaxed text-ink/62 sm:text-[0.95rem]">
            This public page is the canonical entry for the {route.title.toLowerCase()} word study. For source boundaries,
            copyright notes, and the raw-data publication policy, use the methodology and rights page.
          </p>
          <Link
            href="/about"
            className="mt-4 inline-flex w-fit border-b border-ink/70 pb-1 text-[0.72rem] font-black uppercase tracking-[0.15em] text-ink/80 transition hover:border-wine hover:text-wine"
          >
            Methodology and rights
          </Link>
        </div>
        <nav
          aria-label={`Related word studies for ${route.title}`}
          className="flex flex-col justify-between gap-5 border-l-0 border-ink/35 lg:border-l lg:pl-6"
        >
          <div>
            <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-fire/90">related studies</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(relatedRoutes.length > 0 ? relatedRoutes : otherRoutes.slice(0, 3)).map((relatedRoute) => (
                <Link
                  key={relatedRoute.path}
                  href={relatedRoute.path}
                  className="border border-ink/75 bg-transparent px-2.5 py-1.5 text-xs font-black uppercase tracking-[0.08em] text-ink/85 transition hover:-translate-y-0.5 hover:border-ink hover:bg-ink hover:text-wheat"
                >
                  {relatedRoute.title}/
                </Link>
              ))}
            </div>
          </div>
          <Link
            href="/words"
            className="text-xs font-black uppercase tracking-[0.15em] text-nice underline decoration-1 underline-offset-4 hover:text-wine"
          >
            Browse all word studies
          </Link>
        </nav>
      </div>
    </section>
  );
}

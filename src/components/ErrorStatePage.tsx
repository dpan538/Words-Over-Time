"use client";

import Link from "next/link";

type ErrorAction = {
  label: string;
  href?: string;
  onClick?: () => void;
};

type ErrorStatePageProps = {
  code: "404" | "500";
  kicker: string;
  title: string;
  message: string;
  note: string;
  actions?: ErrorAction[];
};

const defaultActions: ErrorAction[] = [
  { label: "Back home", href: "/" },
  { label: "Browse studies", href: "/words" },
  { label: "Methodology", href: "/about" },
];

export function ErrorStatePage({
  code,
  kicker,
  title,
  message,
  note,
  actions = defaultActions,
}: ErrorStatePageProps) {
  const accent = code === "404" ? "text-nice" : "text-wine";

  return (
    <main className="flex min-h-screen items-center bg-wheat px-5 py-12 text-ink sm:px-10 lg:px-16">
      <section className="w-full max-w-[92rem] border-t-2 border-ink pt-7">
        <p className={`font-mono text-[0.86rem] font-black uppercase tracking-[0.22em] sm:text-[1rem] ${accent}`}>
          {kicker}
        </p>

        <h1 className="mt-10 text-[clamp(4.6rem,18vw,15rem)] font-black leading-[0.9] tracking-normal">
          {code}
          <span className="mx-[0.08em] text-ink">/</span>
          <span className={accent}>{title}</span>
        </h1>

        <div className="mt-9 grid gap-5 border-t border-ink/12 pt-7 md:grid-cols-[0.8fr_1.2fr]">
          <p className="max-w-xl text-[1.45rem] font-black leading-[1.08] text-ink sm:text-[2rem]">
            {message}
          </p>
          <p className="max-w-3xl font-mono text-[0.9rem] font-black uppercase leading-7 tracking-[0.14em] text-ink sm:text-[1rem]">
            {note}
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          {actions.map((action) =>
            action.href ? (
              <Link
                key={action.label}
                href={action.href}
                className="border-2 border-ink px-5 py-4 font-mono text-[0.9rem] font-black uppercase tracking-[0.16em] transition hover:bg-ink hover:text-wheat"
              >
                {action.label}
              </Link>
            ) : (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className="border-2 border-ink px-5 py-4 font-mono text-[0.9rem] font-black uppercase tracking-[0.16em] transition hover:bg-ink hover:text-wheat"
              >
                {action.label}
              </button>
            ),
          )}
        </div>
      </section>
    </main>
  );
}

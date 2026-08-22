import Link from "next/link";
import type {
  ErrorAction,
  ErrorStatePageProps,
} from "../error-state-types";
import styles from "./desktop-error-state.module.css";

const defaultActions: ErrorAction[] = [
  { label: "Back home", href: "/" },
  { label: "Browse studies", href: "/words" },
  { label: "Methodology", href: "/about" },
];

export default function DesktopErrorStatePage({
  code,
  title,
  message,
  note,
  reset,
}: ErrorStatePageProps) {
  const accent = "text-nice";
  const actions = reset
    ? [
        defaultActions[0],
        defaultActions[1],
        defaultActions[2],
        { label: "Try again", onClick: reset },
      ]
    : defaultActions;

  return (
    <main
      className={`${styles.root} flex min-h-screen items-center bg-wheat px-5 py-12 text-ink sm:px-10 lg:px-16`}
      data-error-edition="desktop"
    >
      <section className="w-full max-w-[92rem] border-t-2 border-ink pt-7">
        <p
          className={`font-mono text-[0.86rem] font-black uppercase tracking-[0.22em] sm:text-[1rem] ${accent}`}
        >
          Missing route / public boundary
        </p>

        <h1 className="mt-10 flex flex-col text-[clamp(4.8rem,18vw,15rem)] font-black leading-[0.86] tracking-normal">
          <span className="block min-w-[0]">
            {code}
            <span className="ml-[0.08em] text-ink">/</span>
          </span>
          <span className={`block w-[5.9em] ${accent}`}>{title}</span>
        </h1>

        <div className="mt-9 grid min-h-[8.75rem] gap-5 border-t border-ink/12 pt-7 md:grid-cols-[0.8fr_1.2fr]">
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
                className="w-full border-2 border-ink px-5 py-4 text-center font-mono text-[0.9rem] font-black uppercase tracking-[0.16em] transition hover:bg-ink hover:text-wheat sm:w-[12.4rem]"
              >
                {action.label}
              </Link>
            ) : (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className="w-full border-2 border-ink px-5 py-4 text-center font-mono text-[0.9rem] font-black uppercase tracking-[0.16em] transition hover:bg-ink hover:text-wheat sm:w-[12.4rem]"
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

import Link from "next/link";

type NavProps = {
  tone?: "light" | "dark";
};

export function Nav({ tone = "dark" }: NavProps) {
  const linkTone =
    tone === "light"
      ? "text-wheat after:bg-wheat/70 hover:text-sun hover:after:bg-sun"
      : "text-ink after:bg-ink/70 hover:text-wine hover:after:bg-wine";
  const linkBase =
    "relative inline-flex min-h-11 items-center py-2 transition duration-200 after:absolute after:bottom-1 after:h-[2px] after:w-full after:transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current";

  return (
    <nav
      aria-label="Primary navigation"
      className="flex min-w-0 items-center justify-between gap-2 text-[0.68rem] font-bold uppercase tracking-[0.1em] sm:gap-4 sm:text-[0.82rem] sm:tracking-[0.16em]"
    >
      <Link
        href="/"
        className={`${linkBase} min-w-0 after:left-0 ${linkTone}`}
      >
        Words Over Time
      </Link>
      <div className="flex items-center gap-3 sm:gap-6">
        <Link
          href="/words"
          className={`${linkBase} after:left-0 ${linkTone}`}
        >
          Words
        </Link>
        <Link
          href="/about"
          className={`${linkBase} after:right-0 ${linkTone}`}
        >
          About
        </Link>
      </div>
    </nav>
  );
}

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
    "relative inline-block pb-3 transition duration-200 after:absolute after:bottom-0 after:h-[2px] after:w-full after:transition";

  return (
    <nav className="flex items-center justify-between gap-4 text-xs font-bold uppercase tracking-[0.18em]">
      <Link
        href="/"
        className={`${linkBase} after:left-0 ${linkTone}`}
      >
        Words Over Time
      </Link>
      <Link
        href="/about"
        className={`${linkBase} after:right-0 ${linkTone}`}
      >
        About
      </Link>
    </nav>
  );
}

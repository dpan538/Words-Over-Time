import Link from "next/link";

type NavProps = {
  tone?: "light" | "dark";
};

export function Nav({ tone = "dark" }: NavProps) {
  const linkTone =
    tone === "light"
      ? "border-wheat/35 text-wheat hover:border-blaze hover:text-sun"
      : "border-ink/25 text-ink hover:border-wine hover:text-wine";

  return (
    <nav className="flex items-center justify-between gap-4 text-xs font-bold uppercase tracking-[0.18em]">
      <Link
        href="/"
        className={`border-b pb-1 transition duration-200 ${linkTone}`}
      >
        Words Over Time
      </Link>
      <Link
        href="/about"
        className={`border-b pb-1 transition duration-200 ${linkTone}`}
      >
        About
      </Link>
    </nav>
  );
}

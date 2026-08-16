"use client";

import Link from "next/link";
import styles from "@/components/error-state.module.css";

type ErrorAction = {
  label: string;
  href?: string;
  onClick?: () => void;
};

type ErrorStatePageProps = {
  code: "404" | "500";
  title: string;
  message: string;
  note: string;
  reset?: () => void;
};

const defaultActions: ErrorAction[] = [
  { label: "Back home", href: "/" },
  { label: "Browse studies", href: "/words" },
  { label: "Methodology", href: "/about" },
];

export function MobileErrorStatePage({
  code,
  message,
  reset,
}: ErrorStatePageProps) {
  const actions = reset
    ? [
        defaultActions[0],
        defaultActions[1],
        defaultActions[2],
        { label: "Try again", onClick: reset },
      ]
    : defaultActions;

  return (
    <main className={styles.mobileRoot}>
      <nav className={styles.mobileNav} aria-label="Error page navigation">
        <Link href="/">Words Over Time</Link>
        <Link href="/about">About</Link>
      </nav>
      <section className={styles.mobileContent}>
        <p className={styles.mobileEyebrow}>Words Over Time / {code}</p>
        <h1><span>{code}/</span>{code === "404" ? "page not found" : "render interrupted"}</h1>
        <p className={styles.mobileMessage}>{message}</p>
        <p className={styles.mobileNote}>{code === "404" ? "The requested page is not part of the published word field." : "The page could not finish this render. No research source or private working file is exposed by this error."}</p>
        <div className={styles.mobileActions}>
          {actions.map((action) => action.href ? (
            <Link key={action.label} href={action.href}>{action.label}<span aria-hidden="true">→</span></Link>
          ) : (
            <button key={action.label} type="button" onClick={action.onClick}>{action.label}<span aria-hidden="true">↻</span></button>
          ))}
        </div>
      </section>
      <footer className={styles.mobileFooter}>Words Over Time: semantic change and word usage over time</footer>
    </main>
  );
}

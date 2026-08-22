import Link from "next/link";
import type {
  ErrorAction,
  ErrorStatePageProps,
} from "../error-state-types";
import styles from "./mobile-error-state.module.css";

const defaultActions: ErrorAction[] = [
  { label: "Back home", href: "/" },
  { label: "Browse studies", href: "/words" },
  { label: "Methodology", href: "/about" },
];

export function MobileErrorStatePage({
  code,
  title,
  message,
  note,
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
    <main className={styles.root} data-error-edition="mobile">
      <nav className={styles.nav} aria-label="Error page navigation">
        <Link href="/">Words Over Time</Link>
        <Link href="/about">About</Link>
      </nav>
      <section className={styles.content}>
        <p className={styles.eyebrow}>Words Over Time / {code}</p>
        <h1>
          <span>{code}/</span>
          {title}
        </h1>
        <p className={styles.message}>{message}</p>
        <p className={styles.note}>{note}</p>
        <div className={styles.actions}>
          {actions.map((action) =>
            action.href ? (
              <Link key={action.label} href={action.href}>
                {action.label}
                <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
              >
                {action.label}
                <span aria-hidden="true">↻</span>
              </button>
            ),
          )}
        </div>
      </section>
      <footer className={styles.footer}>
        Words Over Time: semantic change and word usage over time
      </footer>
    </main>
  );
}

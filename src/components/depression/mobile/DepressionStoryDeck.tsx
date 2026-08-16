"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import type { DepressionMobileChapter, DepressionMobileResearch } from "@/types/depressionMobileResearch";
import { DepressionPersistentCard } from "./DepressionCardShell";
import { RotaryFrequencyWheel } from "./RotaryFrequencyWheel";
import styles from "./mobile-depression.module.css";

type Face = "front" | "back";
type ChapterId = DepressionMobileChapter["id"];
type SceneId = "opening" | ChapterId | "rotary-interlude" | "closing";

type CopyState = { heading: string; body: string };

const BACK_COPY: Record<ChapterId, CopyState> = {
  roots: {
    heading: "Six dates mark branches, not first uses.",
    body: "Secondary lexical records anchor attested senses. They do not form a comparable historical corpus.",
  },
  print: {
    heading: "The gap narrows across the nineteenth century.",
    body: "Smoothed series compare printed forms in the same corpus; they do not make the three words synonymous.",
  },
  crossover: {
    heading: "Economic compounds become independently visible.",
    body: "Business, financial and economic phrases form a separate market-language branch before the 1930s peak.",
  },
  crisis: {
    heading: "The compounds peak beside the core word.",
    body: "Their timing can be placed beside the economic contraction. The book-frequency data alone cannot establish causation.",
  },
  plateau: {
    heading: "A clinical vocabulary is present, but not yet durable.",
    body: "The low phrase frequencies describe books, not disappearing illness or changing prevalence.",
  },
  labels: {
    heading: "A modern neighbour becomes more visible.",
    body: "Anxiety exceeds depression in the 2010s mean. It is an adjacent comparison, not a synonym or subset.",
  },
};

const LONG_HEADINGS = new Set<ChapterId>(["print", "crossover", "labels"]);

const OPENING_BAND_COLOURS: Record<ChapterId, string> = {
  roots: "#324a7d",
  print: "#267765",
  crossover: "#9f5a19",
  crisis: "#b33a2e",
  plateau: "#725887",
  labels: "#36717a",
};

function OpeningScene({ research, onEnterStudy }: { research: DepressionMobileResearch; onEnterStudy: () => void }) {
  const followOpeningLink = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onEnterStudy();
  };
  return (
    <section id="m-depression-opening" className={`${styles.scene} ${styles.openingScene}`} data-scene="opening" aria-labelledby="mobile-depression-title">
      <header className={styles.siteHeader}>
        <nav aria-label="Primary navigation">
          <Link href="/">WORDS OVER TIME</Link>
          <Link href="/about">ABOUT</Link>
        </nav>
      </header>
      <div className={styles.openingCopy}>
        <p className={styles.sceneLabel}>WORD STUDY</p>
        <h1 id="mobile-depression-title">{research.title}</h1>
        <p className={styles.openingThesis}>{research.thesis}</p>
        <div className={styles.openingGraphic} aria-label="Six chronological chapters in the depression word study">
          <a className={styles.openingArrow} href="#m-depression-roots" aria-label="Continue to Chapter 01" onClick={followOpeningLink}>
            <svg viewBox="0 0 32 32" aria-hidden="true">
              <path d="M16 6v18" />
              <path d="m9.5 17.5 6.5 6.5 6.5-6.5" />
            </svg>
          </a>
          <a className={styles.openingBands} href="#m-depression-roots" aria-label="Continue through the six periods from Chapter 01" onClick={followOpeningLink}>
            <ol>
              {research.chapters.map((chapter) => (
                <li key={chapter.id} style={{ "--opening-band": OPENING_BAND_COLOURS[chapter.id] } as CSSProperties}>
                  <time>{chapter.periodLabel}</time>
                </li>
              ))}
            </ol>
          </a>
        </div>
      </div>
    </section>
  );
}

function ChapterCopyLayer({ copy, active }: { copy: CopyState; active: boolean }) {
  return (
    <div className={styles.copyLayer} data-active={active ? "true" : "false"} aria-hidden={!active}>
      <h2 className={styles.chapterHeading}>{copy.heading}</h2>
      <p className={styles.chapterBody}>{copy.body}</p>
    </div>
  );
}

function ChapterScene({ chapter, face }: { chapter: DepressionMobileChapter; face: Face }) {
  const frontCopy = { heading: chapter.title, body: chapter.deck };
  return (
    <section
      id={`m-depression-${chapter.id}`}
      className={`${styles.scene} ${styles.chapterScene}`}
      data-scene={chapter.id}
      data-chapter={chapter.code}
      data-heading-density={LONG_HEADINGS.has(chapter.id) ? "long" : "standard"}
      style={{ "--chapter-colour": chapter.background } as CSSProperties}
      aria-labelledby={`depression-chapter-${chapter.code}`}
    >
      <div className={styles.chapterNarrative}>
        <p className={styles.chapterMeta}>
          <span>{chapter.code} / {chapter.semanticLabel}</span>
          <span>{chapter.periodLabel}</span>
        </p>
        <div className={styles.chapterCopySlot}>
          <div className={styles.chapterCopy}>
            <span id={`depression-chapter-${chapter.code}`} className={styles.srOnly}>{frontCopy.heading}</span>
            <ChapterCopyLayer copy={frontCopy} active={face === "front"} />
            <ChapterCopyLayer copy={BACK_COPY[chapter.id]} active={face === "back"} />
          </div>
        </div>
      </div>
    </section>
  );
}

function WheelScene({ research }: { research: DepressionMobileResearch }) {
  return (
    <section className={`${styles.scene} ${styles.wheelScene}`} data-scene="rotary-interlude" aria-label="03A interactive phrase frequency wheel">
      <RotaryFrequencyWheel data={research.rotaryInterlude} />
    </section>
  );
}

function ClosingScene({ research, onReturnHome }: { research: DepressionMobileResearch; onReturnHome: () => void }) {
  const followBackToTop = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onReturnHome();
  };
  return (
    <section className={`${styles.scene} ${styles.closingScene}`} data-scene="closing" aria-labelledby="mobile-depression-closing">
      <div className={styles.closingCopy}>
        <p className={styles.sceneLabel}>CLOSING FINDING</p>
        <h2 id="mobile-depression-closing">A branching word does not become one diagnosis.</h2>
        <p className={styles.closingLead}>{research.closingFinding}</p>
      </div>
      <div className={styles.disclosures}>
        <details><summary>SOURCE / CORPUS <span aria-hidden="true">+</span></summary><div><p>All plotted annual rates use the retained English Google Books Ngram series. Lexical anchors and contextual dates remain separate evidence layers.</p><nav aria-label="Depression sources">{research.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label}</a>)}</nav></div></details>
        <details><summary>METHOD / UNIT <span aria-hidden="true">+</span></summary><div>{research.methods.map((method) => <p key={method}>{method}</p>)}</div></details>
        <details><summary>WHAT THIS CANNOT CLAIM <span aria-hidden="true">+</span></summary><div>{research.caveats.map((caveat) => <p key={caveat}>{caveat}</p>)}</div></details>
        <details><summary>RIGHTS / LINKS <span aria-hidden="true">+</span></summary><div>{research.rights.map((right) => <p key={right}>{right}</p>)}<nav aria-label="Project links"><Link href="/about">METHOD AND PROJECT CONTEXT</Link></nav></div></details>
      </div>
      <a className={styles.backToTop} href="#m-depression-opening" onClick={followBackToTop}>BACK TO TOP <span className={styles.upGlyph} aria-hidden="true" /></a>
    </section>
  );
}

export function DepressionStoryDeck({ research }: { research: DepressionMobileResearch }) {
  const deckRef = useRef<HTMLElement>(null);
  const sceneRefs = useRef<Array<HTMLElement | null>>([]);
  const scrollFrameRef = useRef<number | null>(null);
  const scrollCleanupRef = useRef<number | null>(null);
  const activeSceneRef = useRef<SceneId>("opening");
  const chaptersById = useMemo(() => new Map(research.chapters.map((chapter) => [chapter.id, chapter])), [research.chapters]);
  const initialFaces = useMemo(() => Object.fromEntries(research.chapters.map((chapter) => [chapter.id, "front"])) as Record<ChapterId, Face>, [research.chapters]);
  const [faces, setFaces] = useState<Record<ChapterId, Face>>(initialFaces);
  const [activeScene, setActiveScene] = useState<SceneId>("opening");
  const activeChapter = chaptersById.get(activeScene as ChapterId);

  const cancelScrollAnimation = useCallback(() => {
    if (scrollFrameRef.current !== null) cancelAnimationFrame(scrollFrameRef.current);
    if (scrollCleanupRef.current !== null) window.clearTimeout(scrollCleanupRef.current);
    scrollFrameRef.current = null;
    scrollCleanupRef.current = null;
    if (deckRef.current) {
      delete deckRef.current.dataset.linearTransition;
      delete deckRef.current.dataset.returningHome;
      delete deckRef.current.dataset.homeArrival;
    }
  }, []);

  const animateToScene = useCallback((targetIndex: number, hash: string, duration: number, returningHome = false) => {
    const root = deckRef.current;
    const target = sceneRefs.current[targetIndex];
    if (!root || !target) return;
    cancelScrollAnimation();
    const from = root.scrollTop;
    const to = target.offsetTop;
    window.history.pushState(null, "", hash);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.scrollTo({ top: to, behavior: "instant" });
      return;
    }
    const startedAt = performance.now();
    root.dataset.linearTransition = "true";
    if (returningHome) {
      root.dataset.returningHome = "true";
      root.dataset.homeArrival = "false";
    }
    let homeArrivalStarted = false;
    const step = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const nextTop = from + (to - from) * progress;
      root.scrollTo({ top: nextTop, behavior: "instant" });
      if (returningHome && !homeArrivalStarted && nextTop <= root.clientHeight) {
        homeArrivalStarted = true;
        root.dataset.homeArrival = "true";
      }
      if (progress < 1) {
        scrollFrameRef.current = requestAnimationFrame(step);
      } else {
        scrollFrameRef.current = null;
        delete root.dataset.linearTransition;
        if (returningHome) {
          scrollCleanupRef.current = window.setTimeout(() => {
            delete root.dataset.returningHome;
            delete root.dataset.homeArrival;
            scrollCleanupRef.current = null;
          }, 460);
        }
      }
    };
    scrollFrameRef.current = requestAnimationFrame(step);
  }, [cancelScrollAnimation]);

  const enterFirstChapter = useCallback(() => {
    animateToScene(1, "#m-depression-roots", 560);
  }, [animateToScene]);

  const returnToOpening = useCallback(() => {
    const root = deckRef.current;
    const target = sceneRefs.current[0];
    if (!root || !target) return;
    const distance = Math.abs(root.scrollTop - target.offsetTop);
    const duration = Math.min(1450, Math.max(900, distance / 5.4));
    animateToScene(0, "#m-depression-opening", duration, true);
  }, [animateToScene]);

  useEffect(() => {
    const root = deckRef.current;
    if (!root) return;
    root.addEventListener("pointerdown", cancelScrollAnimation, { passive: true });
    root.addEventListener("touchstart", cancelScrollAnimation, { passive: true });
    root.addEventListener("wheel", cancelScrollAnimation, { passive: true });
    return () => {
      root.removeEventListener("pointerdown", cancelScrollAnimation);
      root.removeEventListener("touchstart", cancelScrollAnimation);
      root.removeEventListener("wheel", cancelScrollAnimation);
      cancelScrollAnimation();
    };
  }, [cancelScrollAnimation]);

  useEffect(() => {
    const root = deckRef.current;
    if (!root) return;
    let settleTimer: number | undefined;
    const activateScene = (id: SceneId) => {
      if (activeSceneRef.current === id) return;
      activeSceneRef.current = id;
      setActiveScene(id);
      if (chaptersById.has(id as ChapterId)) {
        setFaces((value) => ({ ...value, [id]: "front" }));
      }
    };
    const activateCenteredScene = () => {
      const rootRect = root.getBoundingClientRect();
      const centre = rootRect.top + rootRect.height / 2;
      const candidate = sceneRefs.current
        .filter((scene): scene is HTMLElement => Boolean(scene))
        .map((scene) => {
          const rect = scene.getBoundingClientRect();
          return { scene, distance: Math.abs(rect.top + rect.height / 2 - centre) };
        })
        .sort((a, b) => a.distance - b.distance)[0]?.scene;
      const id = candidate?.getAttribute("data-scene-id") as SceneId | null;
      if (id) activateScene(id);
    };
    const observer = new IntersectionObserver((entries) => {
      const candidate = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!candidate || candidate.intersectionRatio < .55) return;
      const id = candidate.target.getAttribute("data-scene-id") as SceneId | null;
      if (!id) return;
      activateScene(id);
    }, { root, threshold: [.55, .7, .9] });
    const handleScroll = () => {
      if (settleTimer !== undefined) window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(activateCenteredScene, 90);
    };
    sceneRefs.current.forEach((scene) => scene && observer.observe(scene));
    root.addEventListener("scroll", handleScroll, { passive: true });
    activateCenteredScene();
    return () => {
      observer.disconnect();
      root.removeEventListener("scroll", handleScroll);
      if (settleTimer !== undefined) window.clearTimeout(settleTimer);
    };
  }, [chaptersById]);

  const toggleFace = () => {
    if (!activeChapter) return;
    setFaces((value) => ({ ...value, [activeChapter.id]: value[activeChapter.id] === "front" ? "back" : "front" }));
  };

  const scenes = [
    <OpeningScene key="opening" research={research} onEnterStudy={enterFirstChapter} />,
    ...research.chapters.slice(0, 3).map((chapter) => <ChapterScene key={chapter.id} chapter={chapter} face={faces[chapter.id]} />),
    <WheelScene key="rotary-interlude" research={research} />,
    ...research.chapters.slice(3).map((chapter) => <ChapterScene key={chapter.id} chapter={chapter} face={faces[chapter.id]} />),
    <ClosingScene key="closing" research={research} onReturnHome={returnToOpening} />,
  ];

  return (
    <main ref={deckRef} className={styles.studyDeck} aria-label="Depression mobile word study">
      {scenes.map((scene, index) => (
        <div key={scene.key} data-scene-id={scene.key ?? undefined} ref={(node) => { sceneRefs.current[index] = node; }} className={styles.sceneMount}>{scene}</div>
      ))}
      {activeChapter ? (
        <DepressionPersistentCard
          activeChapter={activeChapter}
          face={faces[activeChapter.id]}
          visible
          onToggle={toggleFace}
        />
      ) : null}
    </main>
  );
}

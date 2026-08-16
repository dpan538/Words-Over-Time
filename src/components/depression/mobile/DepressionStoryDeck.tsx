"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
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

function OpeningScene({ research }: { research: DepressionMobileResearch }) {
  return (
    <section className={`${styles.scene} ${styles.openingScene}`} data-scene="opening" aria-labelledby="mobile-depression-title">
      <header className={styles.siteHeader}>
        <nav aria-label="Primary navigation">
          <Link href="/">WORDS OVER TIME</Link>
          <Link href="/about">ABOUT</Link>
        </nav>
      </header>
      <div className={styles.openingCopy}>
        <p className={styles.sceneLabel}>WORD STUDY</p>
        <h1 id="mobile-depression-title">{research.title}</h1>
        <p>{research.thesis}</p>
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
    <section className={`${styles.scene} ${styles.wheelScene}`} data-scene="rotary-interlude" aria-label="03A market phrase dial">
      <header className={styles.wheelMeta}>
        <span>03A / MARKET PHRASE DIAL</span>
        <span>1874–1939</span>
      </header>
      <div className={styles.wheelStage}>
        <RotaryFrequencyWheel data={research.rotaryInterlude} />
      </div>
    </section>
  );
}

function ClosingScene({ research }: { research: DepressionMobileResearch }) {
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
      <button className={styles.backToTop} type="button" onClick={(event) => event.currentTarget.closest(`.${styles.studyDeck}`)?.scrollTo({ top: 0, behavior: "smooth" })}>BACK TO TOP <span aria-hidden="true">↑</span></button>
    </section>
  );
}

export function DepressionStoryDeck({ research }: { research: DepressionMobileResearch }) {
  const deckRef = useRef<HTMLElement>(null);
  const sceneRefs = useRef<Array<HTMLElement | null>>([]);
  const chaptersById = useMemo(() => new Map(research.chapters.map((chapter) => [chapter.id, chapter])), [research.chapters]);
  const initialFaces = useMemo(() => Object.fromEntries(research.chapters.map((chapter) => [chapter.id, "front"])) as Record<ChapterId, Face>, [research.chapters]);
  const [faces, setFaces] = useState<Record<ChapterId, Face>>(initialFaces);
  const [activeScene, setActiveScene] = useState<SceneId>("opening");
  const activeChapter = chaptersById.get(activeScene as ChapterId);

  useEffect(() => {
    const root = deckRef.current;
    if (!root) return;
    const observer = new IntersectionObserver((entries) => {
      const candidate = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!candidate || candidate.intersectionRatio < .55) return;
      const id = candidate.target.getAttribute("data-scene") as SceneId | null;
      if (!id) return;
      setActiveScene((current) => {
        if (current === id) return current;
        if (chaptersById.has(id as ChapterId)) setFaces((value) => ({ ...value, [id]: "front" }));
        return id;
      });
    }, { root, threshold: [.55, .7, .9] });
    sceneRefs.current.forEach((scene) => scene && observer.observe(scene));
    return () => observer.disconnect();
  }, [chaptersById]);

  const toggleFace = () => {
    if (!activeChapter) return;
    setFaces((value) => ({ ...value, [activeChapter.id]: value[activeChapter.id] === "front" ? "back" : "front" }));
  };

  const scenes = [
    <OpeningScene key="opening" research={research} />,
    ...research.chapters.slice(0, 3).map((chapter) => <ChapterScene key={chapter.id} chapter={chapter} face={faces[chapter.id]} />),
    <WheelScene key="rotary-interlude" research={research} />,
    ...research.chapters.slice(3).map((chapter) => <ChapterScene key={chapter.id} chapter={chapter} face={faces[chapter.id]} />),
    <ClosingScene key="closing" research={research} />,
  ];

  return (
    <>
      <main ref={deckRef} className={styles.studyDeck} aria-label="Depression mobile word study">
        {scenes.map((scene, index) => (
          <div key={scene.key} ref={(node) => { sceneRefs.current[index] = node; }} className={styles.sceneMount}>{scene}</div>
        ))}
      </main>
      <DepressionPersistentCard
        activeChapter={activeChapter}
        face={activeChapter ? faces[activeChapter.id] : "front"}
        visible={Boolean(activeChapter)}
        onToggle={toggleFace}
      />
    </>
  );
}

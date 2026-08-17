"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import type { DepressionMobileChapter, DepressionMobileResearch } from "@/types/depressionMobileResearch";
import { DepressionPersistentCard } from "./DepressionCardShell";
import { RotaryFrequencyWheel } from "./RotaryFrequencyWheel";
import { clampToAdjacentScene } from "./depressionSceneNavigation";
import styles from "./mobile-depression.module.css";

type Face = "front" | "back";
type ChapterId = DepressionMobileChapter["id"];
type SceneId = "opening" | ChapterId | "rotary-interlude" | "closing";
type ReturnPhase = "idle" | "covering" | "revealing";

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
    <section id="m-depression-rotary" className={`${styles.scene} ${styles.wheelScene}`} data-scene="rotary-interlude" aria-label="03A interactive phrase frequency wheel">
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
    <section id="m-depression-closing-scene" className={`${styles.scene} ${styles.closingScene}`} data-scene="closing" aria-labelledby="mobile-depression-closing">
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

function ReturnToTopOverlay({ research, phase }: { research: DepressionMobileResearch; phase: Exclude<ReturnPhase, "idle"> }) {
  return (
    <div className={styles.returnOverlay} data-phase={phase} aria-hidden="true">
      {research.chapters.map((chapter) => (
        <div
          key={chapter.id}
          className={styles.returnOverlayBand}
          style={{ "--return-band": OPENING_BAND_COLOURS[chapter.id] } as CSSProperties}
        >
          <time>{chapter.periodLabel}</time>
        </div>
      ))}
    </div>
  );
}

export function DepressionStoryDeck({ research }: { research: DepressionMobileResearch }) {
  const deckRef = useRef<HTMLElement>(null);
  const sceneRefs = useRef<Array<HTMLElement | null>>([]);
  const scrollFrameRef = useRef<number | null>(null);
  const scrollSampleFrameRef = useRef<number | null>(null);
  const settleTimerRef = useRef<number | null>(null);
  const returnTimerRef = useRef<number | null>(null);
  const returnTransactionRef = useRef(0);
  const returnPhaseRef = useRef<ReturnPhase>("idle");
  const programmaticScrollRef = useRef(false);
  const gestureOriginRef = useRef<number | null>(null);
  const candidateIndexRef = useRef(0);
  const activeIndexRef = useRef(0);
  const activeSceneRef = useRef<SceneId>("opening");
  const chaptersById = useMemo(() => new Map(research.chapters.map((chapter) => [chapter.id, chapter])), [research.chapters]);
  const sceneIds = useMemo<SceneId[]>(() => [
    "opening",
    ...research.chapters.slice(0, 3).map((chapter) => chapter.id),
    "rotary-interlude",
    ...research.chapters.slice(3).map((chapter) => chapter.id),
    "closing",
  ], [research.chapters]);
  const initialFaces = useMemo(() => Object.fromEntries(research.chapters.map((chapter) => [chapter.id, "front"])) as Record<ChapterId, Face>, [research.chapters]);
  const [faces, setFaces] = useState<Record<ChapterId, Face>>(initialFaces);
  const [activeScene, setActiveScene] = useState<SceneId>("opening");
  const [returnPhase, setReturnPhase] = useState<ReturnPhase>("idle");
  const activeChapter = chaptersById.get(activeScene as ChapterId);

  const sceneHash = useCallback((id: SceneId) => {
    if (id === "opening") return "#m-depression-opening";
    if (id === "rotary-interlude") return "#m-depression-rotary";
    if (id === "closing") return "#m-depression-closing-scene";
    return `#m-depression-${id}`;
  }, []);

  const activateSceneAtIndex = useCallback((index: number, updateHash = false) => {
    const id = sceneIds[index];
    if (!id) return;
    activeIndexRef.current = index;
    candidateIndexRef.current = index;
    if (activeSceneRef.current !== id) {
      activeSceneRef.current = id;
      setActiveScene(id);
      if (chaptersById.has(id as ChapterId)) {
        setFaces((value) => value[id as ChapterId] === "front" ? value : { ...value, [id]: "front" });
      }
    }
    if (updateHash && window.location.hash !== sceneHash(id)) {
      window.history.replaceState(null, "", sceneHash(id));
    }
  }, [chaptersById, sceneHash, sceneIds]);

  const cancelScrollAnimation = useCallback(() => {
    if (scrollFrameRef.current !== null) cancelAnimationFrame(scrollFrameRef.current);
    if (settleTimerRef.current !== null) window.clearTimeout(settleTimerRef.current);
    scrollFrameRef.current = null;
    settleTimerRef.current = null;
    programmaticScrollRef.current = false;
    if (deckRef.current) {
      delete deckRef.current.dataset.linearTransition;
    }
  }, []);

  const animateToScene = useCallback((targetIndex: number, hash: string, duration: number) => {
    const root = deckRef.current;
    const target = sceneRefs.current[targetIndex];
    if (!root || !target) return;
    cancelScrollAnimation();
    programmaticScrollRef.current = true;
    gestureOriginRef.current = null;
    const from = root.scrollTop;
    const to = target.offsetTop;
    window.history.pushState(null, "", hash);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.scrollTo({ top: to, behavior: "instant" });
      activateSceneAtIndex(targetIndex);
      programmaticScrollRef.current = false;
      return;
    }
    const startedAt = performance.now();
    root.dataset.linearTransition = "true";
    let activated = false;
    const step = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const nextTop = from + (to - from) * progress;
      root.scrollTo({ top: nextTop, behavior: "instant" });
      if (!activated && progress >= .52) {
        activated = true;
        activateSceneAtIndex(targetIndex);
      }
      if (progress < 1) {
        scrollFrameRef.current = requestAnimationFrame(step);
      } else {
        scrollFrameRef.current = null;
        activateSceneAtIndex(targetIndex);
        programmaticScrollRef.current = false;
        delete root.dataset.linearTransition;
      }
    };
    scrollFrameRef.current = requestAnimationFrame(step);
  }, [activateSceneAtIndex, cancelScrollAnimation]);

  const enterFirstChapter = useCallback(() => {
    animateToScene(1, "#m-depression-roots", 560);
  }, [animateToScene]);

  const returnToOpening = useCallback(() => {
    const root = deckRef.current;
    const target = sceneRefs.current[0];
    if (!root || !target) return;
    if (returnPhaseRef.current !== "idle") return;
    cancelScrollAnimation();
    if (returnTimerRef.current !== null) window.clearTimeout(returnTimerRef.current);
    const transaction = ++returnTransactionRef.current;
    gestureOriginRef.current = null;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.scrollTo({ top: target.offsetTop, behavior: "instant" });
      activateSceneAtIndex(0);
      window.history.pushState(null, "", "#m-depression-opening");
      return;
    }
    returnPhaseRef.current = "covering";
    setReturnPhase("covering");
    returnTimerRef.current = window.setTimeout(() => {
      if (transaction !== returnTransactionRef.current) return;
      root.scrollTo({ top: target.offsetTop, behavior: "instant" });
      activateSceneAtIndex(0);
      window.history.pushState(null, "", "#m-depression-opening");
      returnPhaseRef.current = "revealing";
      setReturnPhase("revealing");
      returnTimerRef.current = window.setTimeout(() => {
        if (transaction === returnTransactionRef.current) {
          returnPhaseRef.current = "idle";
          setReturnPhase("idle");
        }
        returnTimerRef.current = null;
      }, 380);
    }, 380);
  }, [activateSceneAtIndex, cancelScrollAnimation]);

  const closestSceneIndex = useCallback(() => {
    const root = deckRef.current;
    if (!root) return activeIndexRef.current;
    const rootRect = root.getBoundingClientRect();
    const centre = rootRect.top + rootRect.height / 2;
    let closestIndex = activeIndexRef.current;
    let closestDistance = Number.POSITIVE_INFINITY;
    sceneRefs.current.forEach((scene, index) => {
      if (!scene) return;
      const rect = scene.getBoundingClientRect();
      const distance = Math.abs(rect.top + rect.height / 2 - centre);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    return closestIndex;
  }, []);

  const settleToAdjacentScene = useCallback(() => {
    const root = deckRef.current;
    if (!root || programmaticScrollRef.current || returnPhaseRef.current !== "idle") return;
    const origin = gestureOriginRef.current ?? activeIndexRef.current;
    const candidate = candidateIndexRef.current;
    const targetIndex = clampToAdjacentScene(origin, candidate, sceneIds.length);
    const target = sceneRefs.current[targetIndex];
    gestureOriginRef.current = null;
    candidateIndexRef.current = targetIndex;
    delete root.dataset.scrollActive;
    if (target && Math.abs(root.scrollTop - target.offsetTop) > 1) {
      root.scrollTo({ top: target.offsetTop, behavior: "instant" });
    }
    activateSceneAtIndex(targetIndex, true);
  }, [activateSceneAtIndex, sceneIds.length]);

  useEffect(() => {
    const root = deckRef.current;
    if (!root) return;
    const scheduleSettle = (delay = 130) => {
      if (settleTimerRef.current !== null) window.clearTimeout(settleTimerRef.current);
      settleTimerRef.current = window.setTimeout(() => {
        settleTimerRef.current = null;
        settleToAdjacentScene();
      }, delay);
    };
    const beginGesture = () => {
      if (programmaticScrollRef.current || returnPhaseRef.current !== "idle") return;
      if (gestureOriginRef.current === null) gestureOriginRef.current = activeIndexRef.current;
      root.dataset.scrollActive = "true";
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "touch" && event.pointerType !== "pen") return;
      cancelScrollAnimation();
      beginGesture();
    };
    const handlePointerEnd = () => scheduleSettle(150);
    const handleTouchStart = () => {
      if ("PointerEvent" in window) return;
      cancelScrollAnimation();
      beginGesture();
    };
    const handleWheel = () => {
      cancelScrollAnimation();
      beginGesture();
      scheduleSettle(170);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!["ArrowDown", "ArrowUp", "PageDown", "PageUp", " "].includes(event.key)) return;
      beginGesture();
      scheduleSettle(170);
    };
    const handleScroll = () => {
      if (programmaticScrollRef.current || returnPhaseRef.current !== "idle") return;
      beginGesture();
      const origin = gestureOriginRef.current ?? activeIndexRef.current;
      const originScene = sceneRefs.current[origin];
      if (originScene) {
        const delta = root.scrollTop - originScene.offsetTop;
        const direction = Math.sign(delta);
        if (direction !== 0) {
          const adjacent = clampToAdjacentScene(origin, origin + direction, sceneIds.length);
          const adjacentScene = sceneRefs.current[adjacent];
          const distance = adjacentScene ? Math.abs(adjacentScene.offsetTop - originScene.offsetTop) : 0;
          const progress = distance > 0 ? Math.abs(delta) / distance : 0;
          const responsiveIndex = progress >= .08 ? adjacent : origin;
          if (responsiveIndex !== activeIndexRef.current) activateSceneAtIndex(responsiveIndex);
        }
      }
      if (scrollSampleFrameRef.current === null) {
        scrollSampleFrameRef.current = requestAnimationFrame(() => {
          const candidate = closestSceneIndex();
          candidateIndexRef.current = candidate;
          scrollSampleFrameRef.current = null;
        });
      }
      scheduleSettle(130);
    };
    const handleScrollEnd = () => scheduleSettle(24);
    const handleViewportChange = () => {
      const active = sceneRefs.current[activeIndexRef.current];
      if (!active || programmaticScrollRef.current || returnPhaseRef.current !== "idle") return;
      requestAnimationFrame(() => root.scrollTo({ top: active.offsetTop, behavior: "instant" }));
    };
    const handleHashChange = () => {
      const index = sceneIds.findIndex((id) => sceneHash(id) === window.location.hash);
      const target = sceneRefs.current[index];
      if (index < 0 || !target) return;
      cancelScrollAnimation();
      programmaticScrollRef.current = true;
      root.scrollTo({ top: target.offsetTop, behavior: "instant" });
      activateSceneAtIndex(index);
      programmaticScrollRef.current = false;
    };
    const observer = new IntersectionObserver((entries) => {
      const candidate = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!candidate || candidate.intersectionRatio < .55) return;
      const index = sceneRefs.current.indexOf(candidate.target as HTMLElement);
      if (index >= 0) candidateIndexRef.current = index;
    }, { root, threshold: [.55, .7, .9] });
    sceneRefs.current.forEach((scene) => scene && observer.observe(scene));
    root.addEventListener("pointerdown", handlePointerDown, { passive: true });
    root.addEventListener("pointerup", handlePointerEnd, { passive: true });
    root.addEventListener("pointercancel", handlePointerEnd, { passive: true });
    root.addEventListener("touchstart", handleTouchStart, { passive: true });
    root.addEventListener("touchend", handlePointerEnd, { passive: true });
    root.addEventListener("touchcancel", handlePointerEnd, { passive: true });
    root.addEventListener("wheel", handleWheel, { passive: true });
    root.addEventListener("keydown", handleKeyDown);
    root.addEventListener("scroll", handleScroll, { passive: true });
    root.addEventListener("scrollend", handleScrollEnd);
    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("depression:viewportchange", handleViewportChange);
    const initialIndex = sceneIds.findIndex((id) => sceneHash(id) === window.location.hash);
    if (initialIndex >= 0) {
      const target = sceneRefs.current[initialIndex];
      if (target) {
        programmaticScrollRef.current = true;
        root.scrollTo({ top: target.offsetTop, behavior: "instant" });
        activateSceneAtIndex(initialIndex);
        programmaticScrollRef.current = false;
      }
    } else {
      activateSceneAtIndex(closestSceneIndex());
    }
    return () => {
      observer.disconnect();
      root.removeEventListener("pointerdown", handlePointerDown);
      root.removeEventListener("pointerup", handlePointerEnd);
      root.removeEventListener("pointercancel", handlePointerEnd);
      root.removeEventListener("touchstart", handleTouchStart);
      root.removeEventListener("touchend", handlePointerEnd);
      root.removeEventListener("touchcancel", handlePointerEnd);
      root.removeEventListener("wheel", handleWheel);
      root.removeEventListener("keydown", handleKeyDown);
      root.removeEventListener("scroll", handleScroll);
      root.removeEventListener("scrollend", handleScrollEnd);
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("depression:viewportchange", handleViewportChange);
      if (settleTimerRef.current !== null) window.clearTimeout(settleTimerRef.current);
      if (scrollSampleFrameRef.current !== null) cancelAnimationFrame(scrollSampleFrameRef.current);
      delete root.dataset.scrollActive;
    };
  }, [activateSceneAtIndex, cancelScrollAnimation, closestSceneIndex, sceneHash, sceneIds, settleToAdjacentScene]);

  useEffect(() => () => {
    returnTransactionRef.current += 1;
    if (returnTimerRef.current !== null) window.clearTimeout(returnTimerRef.current);
    cancelScrollAnimation();
  }, [cancelScrollAnimation]);

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
    <main
      ref={deckRef}
      className={styles.studyDeck}
      data-depression-deck="true"
      data-active-scene={activeScene}
      aria-label="Depression mobile word study"
    >
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
      {returnPhase !== "idle" ? <ReturnToTopOverlay research={research} phase={returnPhase} /> : null}
    </main>
  );
}

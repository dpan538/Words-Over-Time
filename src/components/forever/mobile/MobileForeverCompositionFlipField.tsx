"use client";

import { useState } from "react";

import type { ForeverMobileAnalysis } from "@/types/foreverMobileAnalysis";
import styles from "./mobile-forever.module.css";

type MobileForeverCompositionFlipFieldProps = {
  milestones: ForeverMobileAnalysis["milestones"];
  transition: ForeverMobileAnalysis["secondTransition"];
};

export function MobileForeverCompositionFlipField({ milestones, transition }: MobileForeverCompositionFlipFieldProps) {
  const [openTileId, setOpenTileId] = useState<string | null>(null);
  const low = milestones.low1980s;
  const now = milestones.return2010s;
  const tiles = [
    {
      id: "spaced-1980s",
      className: styles.tileUpperLeft,
      tone: styles.tileSpacedPale,
      scope: "1980s / for ever",
      value: 100 - low.joinedShareOfExactFormAppearances,
      unit: "%",
      back: `${low.spacedRatePerMillionWords.toFixed(2)} exact-form appearances per million corpus word tokens at the pair's low.`,
    },
    {
      id: "joined-1980s",
      className: styles.tileUpperRight,
      tone: styles.tileJoinedStrong,
      scope: "1980s / forever",
      value: low.joinedShareOfExactFormAppearances,
      unit: "%",
      back: `${low.joinedRatePerMillionWords.toFixed(2)} per million; the joined form already leads before the late rebound.`,
    },
    {
      id: "spaced-2010s",
      className: styles.tileMiddleLeft,
      tone: styles.tileSpacedStrong,
      scope: "2010s / for ever",
      value: 100 - now.joinedShareOfExactFormAppearances,
      unit: "%",
      back: `${now.spacedRatePerMillionWords.toFixed(2)} per million; rate rises ${transition.spacedRateFactor.toFixed(2)}× from the 1980s.`,
    },
    {
      id: "joined-2010s",
      className: styles.tileMiddleRight,
      tone: styles.tileJoinedPale,
      scope: "2010s / forever",
      value: now.joinedShareOfExactFormAppearances,
      unit: "%",
      back: `${now.joinedRatePerMillionWords.toFixed(2)} per million; rate rises ${transition.joinedRateFactor.toFixed(2)}× from the 1980s.`,
    },
  ];

  const pairGroups = [
    { id: "1980s", label: "1980s pair / total 100%", tiles: tiles.slice(0, 2) },
    { id: "2010s", label: "2010s pair / total 100%", tiles: tiles.slice(2, 4) },
  ];

  return (
    <section
      className={styles.compositionSection}
      data-figure-id="F03"
      data-surface-category="visualization"
      aria-labelledby="m-forever-f03-title"
    >
      <header className={styles.compositionHeader}>
        <p className={styles.figureIndex}>03 / SECOND TURN</p>
        <h2 id="m-forever-f03-title">Rebound without another switch</h2>
        <p>Both forms return after the spelling balance has already settled near four-fifths joined.</p>
      </header>
      <div className={styles.compositionMosaic} aria-label="1980s and 2010s exact-form spelling composition">
        {pairGroups.map((group) => (
          <section className={styles.compositionPair} aria-labelledby={`m-forever-${group.id}-pair`} key={group.id}>
            <h3 id={`m-forever-${group.id}-pair`}>{group.label}</h3>
            <div className={styles.compositionPairStack}>
              {group.tiles.map((tile) => (
                <button className={`${styles.compositionTile} ${tile.className} ${tile.tone}`} data-open={openTileId === tile.id} type="button" aria-pressed={openTileId === tile.id} aria-label={`Flip ${tile.scope} card`} onClick={() => setOpenTileId((current) => current === tile.id ? null : tile.id)} key={tile.id}>
                  <span className={styles.compositionTileInner}>
                    <span className={styles.tileFront}>
                      <span className={styles.tileLabel}>{tile.scope}</span>
                      <strong>{tile.value.toFixed(2)}{tile.unit}</strong>
                      <span className={styles.tileAction}>TAP TO FLIP</span>
                    </span>
                    <span className={styles.tileBack}>
                      <span className={styles.tileLabel}>{tile.scope}</span>
                      <span className={styles.tileBackCopy}>{tile.back}</span>
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
      <p className={styles.shareBandStatement}>
        <strong>{transition.shareBand1990sTo2010s.widthPercentagePoints.toFixed(2)} pp</strong>
        <span>1990s–2010s joined-share band width / {transition.shareBand1990sTo2010s.minimum.toFixed(2)}–{transition.shareBand1990sTo2010s.maximum.toFixed(2)}%</span>
      </p>
      <p className={styles.localCaveat}>Share is calculated only within the two exact forms; it is not language-wide spelling adoption.</p>
    </section>
  );
}

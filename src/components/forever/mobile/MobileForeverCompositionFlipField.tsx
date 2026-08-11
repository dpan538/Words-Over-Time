import type { ForeverMobileAnalysis } from "@/types/foreverMobileAnalysis";
import styles from "./mobile-forever.module.css";

type MobileForeverCompositionFlipFieldProps = {
  milestones: ForeverMobileAnalysis["milestones"];
  transition: ForeverMobileAnalysis["secondTransition"];
};

export function MobileForeverCompositionFlipField({ milestones, transition }: MobileForeverCompositionFlipFieldProps) {
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
    {
      id: "share-band",
      className: styles.tileLowerLeft,
      tone: styles.tileBand,
      scope: "1990s–2010s / band",
      value: transition.shareBand1990sTo2010s.widthPercentagePoints,
      unit: " pp",
      back: `Joined share stays inside ${transition.shareBand1990sTo2010s.minimum.toFixed(2)}–${transition.shareBand1990sTo2010s.maximum.toFixed(2)}% while the pair rate rises ${transition.shareBand1990sTo2010s.combinedRateFactor.toFixed(2)}×.`,
    },
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
        {tiles.map((tile) => (
          <details className={`${styles.compositionTile} ${tile.className} ${tile.tone}`} name="forever-composition" key={tile.id}>
            <summary>
              <span className={styles.tileFront}>
                <span className={styles.tileLabel}>{tile.scope}</span>
                <strong>{tile.value.toFixed(2)}{tile.unit}</strong>
                <span className={styles.tileAction}>FLIP +</span>
              </span>
              <span className={styles.tileBack}>
                <span className={styles.tileLabel}>{tile.scope}</span>
                <span className={styles.tileBackCopy}>{tile.back}</span>
                <span className={styles.tileAction}>FRONT ×</span>
              </span>
            </summary>
          </details>
        ))}
      </div>
      <p className={styles.localCaveat}>Share is calculated only within the two exact forms; it is not language-wide spelling adoption.</p>
    </section>
  );
}

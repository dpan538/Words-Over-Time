"use client";

import type { DepressionMobileResearch } from "@/types/depressionMobileResearch";
import { DepressionStoryDeck } from "./DepressionStoryDeck";
import styles from "./mobile-depression.module.css";

type MobileDepressionStudyProps = {
  research: DepressionMobileResearch;
};

export function MobileDepressionStudy({ research }: MobileDepressionStudyProps) {
  return (
    <article id="m-depression-top" className={styles.mobileStudy} data-depression-edition="mobile-research">
      <DepressionStoryDeck research={research} />
    </article>
  );
}

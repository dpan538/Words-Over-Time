"use client";

import { useEffect } from "react";
import type { DepressionMobileResearch } from "@/types/depressionMobileResearch";
import { DepressionStoryDeck } from "./DepressionStoryDeck";
import { installDepressionViewportHeight } from "./installDepressionViewportHeight";
import styles from "./mobile-depression.module.css";

type MobileDepressionStudyProps = {
  research: DepressionMobileResearch;
};

export function MobileDepressionStudy({ research }: MobileDepressionStudyProps) {
  useEffect(() => installDepressionViewportHeight(), []);

  return (
    <article id="m-depression-top" className={styles.mobileStudy} data-depression-edition="mobile-research">
      <DepressionStoryDeck research={research} />
    </article>
  );
}

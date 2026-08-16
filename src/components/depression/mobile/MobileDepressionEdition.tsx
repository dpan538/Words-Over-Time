import { depressionMobileResearch } from "@/data/depressionMobileResearch";
import { MobileDepressionStudy } from "./MobileDepressionStudy";

/**
 * Mobile-only entrypoint for the depression study.
 *
 * It deliberately has no desktop imports: mobile data, composition, interaction,
 * and styling stay inside the mobile edition boundary.
 */
export function MobileDepressionEdition() {
  return <MobileDepressionStudy research={depressionMobileResearch} />;
}

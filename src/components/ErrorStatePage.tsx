"use client";

import { EditionBoundary } from "@/components/edition/EditionBoundary";
import { DesktopErrorStatePage } from "@/editions/desktop/DesktopErrorStatePage";
import { MobileErrorStatePage } from "@/editions/mobile/MobileErrorStatePage";

type ErrorStatePageProps = {
  code: "404" | "500";
  title: string;
  message: string;
  note: string;
  reset?: () => void;
};

/** Thin error-route dispatcher; all presentation remains edition-specific. */
export function ErrorStatePage(props: ErrorStatePageProps) {
  return (
    <EditionBoundary
      desktop={<DesktopErrorStatePage {...props} />}
      mobile={<MobileErrorStatePage {...props} />}
    />
  );
}

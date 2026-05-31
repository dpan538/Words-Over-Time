"use client";

import { ErrorStatePage } from "@/components/ErrorStatePage";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <ErrorStatePage
      code="500"
      title="error"
      message="The research surface failed to render this request."
      note="No raw source cache or private research data is exposed by this error. Try reloading the page, or return to the public index while the route settles."
      reset={reset}
    />
  );
}

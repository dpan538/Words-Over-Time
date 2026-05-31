"use client";

import { ErrorStatePage } from "@/components/ErrorStatePage";
import "./globals.css";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body>
        <ErrorStatePage
          code="500"
          kicker="global fault / render boundary"
          title="error"
          message="The archive could not complete this render."
          note="The public site keeps source boundaries intact even when a route fails. Try the request again, or return to the word-study index."
          actions={[
            { label: "Try again", onClick: reset },
            { label: "Back home", href: "/" },
            { label: "Browse studies", href: "/words" },
          ]}
        />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { ErrorStatePage } from "@/components/ErrorStatePage";

export const metadata: Metadata = {
  title: "Page Not Found | Words Over Time",
  description: "The requested Words Over Time route could not be found.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <ErrorStatePage
      code="404"
      title="not found"
      message="This word path is outside the public index."
      note="The archive exposes selected studies, methodology notes, citation records, and public routes. Raw caches, private acquisition logs, and unpublished intermediates remain outside the searchable surface."
    />
  );
}

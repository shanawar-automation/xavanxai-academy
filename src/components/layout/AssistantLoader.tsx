"use client";

import dynamic from "next/dynamic";

// Loaded lazily and only in the browser, so it never slows down first paint.
const XavanCompanyAssistant = dynamic(
  () =>
    import("@/components/assistant/XavanCompanyAssistant").then(
      (m) => m.XavanCompanyAssistant
    ),
  { ssr: false }
);

export function AssistantLoader() {
  return <XavanCompanyAssistant />;
}

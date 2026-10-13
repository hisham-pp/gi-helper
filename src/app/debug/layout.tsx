import type { Metadata } from "next";

/** Internal diagnostic tools: keep every /debug route out of search results. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DebugLayout({ children }: { children: React.ReactNode }) {
  return children;
}

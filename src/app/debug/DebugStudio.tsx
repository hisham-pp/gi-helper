"use client";

import dynamic from "next/dynamic";

/** The Grid & Material Studio is canvas-heavy: client-only, loaded on demand. */
const GridSessionStudio = dynamic(
  () => import("@/components/grid-detector/GridSessionStudio").then((m) => m.GridSessionStudio),
  { ssr: false },
);

export function DebugStudio() {
  return (
    <div className="w-full max-w-7xl">
      <GridSessionStudio />
    </div>
  );
}

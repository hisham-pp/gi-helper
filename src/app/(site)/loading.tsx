import { Loader2 } from "lucide-react";

/** A soft line of placeholder text; white/x is the theme ink, so it works in light mode too. */
function Line({ className }: { className: string }) {
  return (
    <div
      className={`rounded-full bg-white/10 motion-safe:animate-pulse ${className}`}
    />
  );
}

/**
 * Page placeholder in the site's glass style: a hero card like every page's
 * header, then a few content cards. Shown below the shared top bar
 * (app/(site)/layout.tsx), which stays in place while a page loads.
 */
export default function Loading() {
  return (
    <div
      className="flex w-full flex-1 flex-col items-center justify-start px-4 pb-4 pt-2 sm:px-6 sm:pt-4 md:px-8 md:pb-8"
      aria-busy="true"
    >
      <span className="sr-only" role="status">
        Loading…
      </span>
      <div className="w-full max-w-4xl space-y-6" aria-hidden="true">
        {/* Hero */}
        <div className="glass-card glass-card--lg p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="glass-chip h-9 w-9 shrink-0 justify-center rounded-xl text-cyan-300">
              <Loader2 className="h-5 w-5 motion-safe:animate-spin" />
            </span>
            <Line className="h-7 w-48 sm:h-8 sm:w-64" />
          </div>
          <div className="mt-4 space-y-2">
            <Line className="h-3 w-full max-w-xl" />
            <Line className="h-3 w-2/3 max-w-md" />
          </div>
        </div>

        {/* Content */}
        {[0, 1, 2].map((i) => (
          <div key={i} className="glass-card p-5">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 shrink-0 rounded-full bg-white/10 motion-safe:animate-pulse" />
              <div className="space-y-1.5">
                <Line className="h-3 w-32" />
                <Line className="h-2.5 w-20" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Line className="h-3 w-full" />
              <Line className={`h-3 ${i === 1 ? "w-1/2" : "w-4/5"}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

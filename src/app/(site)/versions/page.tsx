import type { Metadata } from "next";
import { Bug, History, Minus, Sparkles, TrendingUp, type LucideIcon } from "lucide-react";
import { pageMetadata } from "@/lib/seo";
import { CHANGE_TYPES, getVersions, type ChangeType, type VersionRelease } from "@/lib/versions";

export const metadata: Metadata = pageMetadata({
  title: "Release Notes",
  description:
    "What's new in GI Helper: features, improvements and fixes in each version of the Genshin Impact inventory scanner.",
  path: "/versions",
});

/** Heading, icon and accent ("r, g, b" for --glass-accent) for each change group. */
const CHANGE_STYLES: Record<ChangeType, { label: string; icon: LucideIcon; text: string; accent: string }> = {
  new: { label: "New", icon: Sparkles, text: "text-cyan-300", accent: "103, 232, 249" },
  improved: { label: "Improved", icon: TrendingUp, text: "text-violet-300", accent: "192, 132, 252" },
  fixed: { label: "Fixed", icon: Bug, text: "text-amber-300", accent: "251, 191, 36" },
  removed: { label: "Removed", icon: Minus, text: "text-rose-300", accent: "251, 113, 133" },
};

/** Dates are plain YYYY-MM-DD, so format in UTC to keep the same day everywhere. */
function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function ReleaseCard({ release, isLatest }: { release: VersionRelease; isLatest: boolean }) {
  const groups = CHANGE_TYPES.map((type) => ({
    type,
    items: release.changes.filter((change) => change.type === type),
  })).filter((group) => group.items.length > 0);

  return (
    <article id={`v${release.slug}`} className="glass-card glass-card--lg scroll-mt-6 p-6 sm:p-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="glass-chip px-3 py-1 font-mono text-xs font-bold text-white">
            v{release.version}
          </span>
          {isLatest && (
            <span
              data-active="true"
              className="glass-chip px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-200"
            >
              Latest
            </span>
          )}
          <time dateTime={release.date} className="text-xs text-white/60">
            {formatDate(release.date)}
          </time>
        </div>
        <h2 className="text-xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-2xl">
          {release.title}
        </h2>
        {release.summary && (
          <p className="max-w-3xl text-sm leading-relaxed text-white/80">{release.summary}</p>
        )}
      </header>

      <hr className="glass-divider my-5" />

      <div className="space-y-5">
        {groups.map(({ type, items }) => {
          const style = CHANGE_STYLES[type];
          const Icon = style.icon;
          return (
            <section key={type} aria-label={style.label}>
              <h3 className="mb-2.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/90">
                <span
                  style={{ "--glass-accent": style.accent } as React.CSSProperties}
                  className={`glass-chip h-6 w-6 justify-center rounded-lg ${style.text}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                {style.label}
              </h3>
              <ul className="space-y-2 pl-1">
                {items.map((change, index) => (
                  <li key={index} className="flex gap-2.5 text-sm leading-relaxed text-white/85">
                    <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current ${style.text}`} />
                    <span>{change.text}</span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </article>
  );
}

export default function VersionsPage() {
  const versions = getVersions();
  const latest = versions[0];

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-start px-4 pb-4 pt-2 sm:px-6 sm:pt-4 md:px-8 md:pb-8">
      <main className="w-full max-w-4xl space-y-6 pb-12">
        {/* Hero Header */}
        <div className="glass-card glass-card--lg p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="glass-chip h-9 w-9 justify-center rounded-xl text-cyan-300">
                  <History className="h-5 w-5" />
                </span>
                <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-3xl md:text-4xl">
                  Release Notes
                </h1>
              </div>
              <p className="max-w-2xl text-xs text-white/80 sm:text-sm">
                What changed in each version of GI Helper, newest first.
              </p>
            </div>

            {latest && (
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <span className="glass-chip px-3.5 py-1.5 font-mono text-xs font-bold text-white">
                  <span className="text-cyan-300">Current:</span> v{latest.version}
                </span>
                <span className="glass-chip px-3.5 py-1.5 font-mono text-xs font-bold text-white">
                  <span className="text-cyan-300">Releases:</span> {versions.length}
                </span>
              </div>
            )}
          </div>
        </div>

        {versions.length === 0 ? (
          <div className="glass-card glass-card--lg p-8 text-center text-sm text-white/70">
            No releases published yet.
          </div>
        ) : (
          versions.map((release, index) => (
            <ReleaseCard key={release.slug} release={release} isLatest={index === 0} />
          ))
        )}
      </main>
    </div>
  );
}

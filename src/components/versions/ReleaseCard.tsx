import { Bug, Minus, Sparkles, TrendingUp, type LucideIcon } from "lucide-react";
import { CHANGE_TYPES, type ChangeType, type VersionRelease } from "@/lib/release-notes";

/*
 * One release on /versions. Plain markup, so the server-rendered page and the
 * client list of older releases (OlderReleases) both use it.
 */

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

export function ReleaseCard({ release, isLatest }: { release: VersionRelease; isLatest: boolean }) {
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

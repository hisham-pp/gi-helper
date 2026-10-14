import type { Metadata } from "next";
import { History } from "lucide-react";
import { pageMetadata } from "@/lib/seo";
import { OlderReleases } from "@/components/versions/OlderReleases";
import { ReleaseCard } from "@/components/versions/ReleaseCard";
import { getVersions, RELEASES_PER_PAGE } from "@/lib/versions";

export const metadata: Metadata = pageMetadata({
  title: "Release Notes",
  description:
    "What's new in GI Helper: features, improvements and fixes in each version of the Genshin Impact inventory scanner.",
  path: "/versions",
});

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
          <>
            {/* The newest ten; older ones load on request (OlderReleases) */}
            {versions.slice(0, RELEASES_PER_PAGE).map((release, index) => (
              <ReleaseCard key={release.slug} release={release} isLatest={index === 0} />
            ))}
            <OlderReleases total={versions.length} />
          </>
        )}
      </main>
    </div>
  );
}

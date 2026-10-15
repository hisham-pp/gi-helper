import React from "react";
import {
  Backpack,
  Flower2,
  History,
  Info,
  MessageSquareHeart,
  PackageCheck,
  Swords,
  Users,
  type LucideIcon,
} from "lucide-react";

/** A soft line of placeholder text; white/x is the theme ink, so it works in light mode too. */
function Line({ className }: { className: string }) {
  return <div className={`rounded-full bg-white/10 motion-safe:animate-pulse ${className}`} />;
}

/** Same outer spacing as the content pages. */
function ShellPage({ width, children }: { width: string; children: React.ReactNode }) {
  return (
    <div
      className="flex w-full flex-1 flex-col items-center justify-start px-4 pb-4 pt-2 sm:px-6 sm:pt-4 md:px-8 md:pb-8"
      aria-busy="true"
    >
      <span className="sr-only" role="status">
        Loading…
      </span>
      <div className={`w-full ${width} space-y-6`} aria-hidden="true">
        {children}
      </div>
    </div>
  );
}

/** The page's hero card with its real icon and title, so the page is recognisable at once. */
function Hero({ icon: Icon, title, chips = 0 }: { icon: LucideIcon; title: string; chips?: number }) {
  return (
    <div className="glass-card glass-card--lg p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="glass-chip h-9 w-9 justify-center rounded-xl text-cyan-300">
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-2xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-3xl md:text-4xl">
              {title}
            </span>
          </div>
          <Line className="h-3 w-64 max-w-full sm:w-80" />
        </div>
        {chips > 0 && (
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {Array.from({ length: chips }, (_, i) => (
              <div key={i} className="glass-chip h-8 w-24 motion-safe:animate-pulse" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Search, sort and filter bar of the material lists. */
function FilterBar() {
  return (
    <div className="glass-card glass-card--lg space-y-4 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="glass-track h-10 w-full md:max-w-sm" />
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="glass-track h-9 w-36" />
          <div className="glass-track h-9 w-28" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {[16, 20, 24, 18, 22].map((w, i) => (
          <div key={i} className="glass-chip h-7 motion-safe:animate-pulse" style={{ width: `${w * 4}px` }} />
        ))}
      </div>
    </div>
  );
}

/** Grid of material cards. */
function CardGrid({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="glass-card flex flex-col items-center gap-3 p-4">
          <div className="h-16 w-16 rounded-2xl bg-white/10 motion-safe:animate-pulse" />
          <Line className="h-3 w-3/4" />
          <Line className="h-2.5 w-1/2" />
        </div>
      ))}
    </div>
  );
}

/** The database pages' sub-nav (materials, characters, weapons, artifacts). */
function DatabaseTabs() {
  return <div className="glass-track h-[42px] w-full sm:w-[440px]" />;
}

/** Text cards, like release notes or feedback posts. */
function TextCards({ count, avatar = false }: { count: number; avatar?: boolean }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="glass-card p-5">
          <div className="flex items-center gap-2.5">
            {avatar && <div className="h-9 w-9 shrink-0 rounded-full bg-white/10 motion-safe:animate-pulse" />}
            <div className="space-y-1.5">
              <Line className="h-3 w-32" />
              <Line className="h-2.5 w-20" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Line className="h-3 w-full" />
            <Line className={`h-3 ${i % 2 ? "w-1/2" : "w-4/5"}`} />
          </div>
        </div>
      ))}
    </>
  );
}

function HomeShell() {
  return (
    <div className="flex w-full flex-1 flex-col items-center px-4 pb-4 pt-2 sm:px-6 sm:pt-4 md:px-8" aria-busy="true">
      <span className="sr-only" role="status">
        Loading…
      </span>
      <div className="flex w-full max-w-4xl flex-col items-center space-y-6" aria-hidden="true">
        <div className="flex flex-col items-center space-y-3">
          <Line className="h-8 w-72 max-w-full sm:h-9 sm:w-96" />
          <Line className="h-3 w-64 max-w-full sm:w-[28rem]" />
        </div>
        <div className="glass-track h-[52px] w-full max-w-[520px]" />
        <div className="glass-pane min-h-[360px] w-full motion-safe:animate-pulse" />
      </div>
    </div>
  );
}

/**
 * Skeleton of each public page, shown by PageShellSlot while a link's page is
 * on its way. Keyed by pathname; pages without one show no shell.
 */
export const PAGE_SHELLS: Record<string, () => React.ReactElement> = {
  "/": HomeShell,
  // One shell per inventory page: the header and links are the same on all four
  ...Object.fromEntries(
    ["materials", "characters", "weapons", "artifacts"].map((tab) => [
      `/inventory/${tab}`,
      () => (
        <ShellPage width="max-w-7xl">
          <Hero icon={Backpack} title="Inventory" chips={2} />
          <div className="glass-track h-[42px] w-full max-w-[520px]" />
          <FilterBar />
          <CardGrid count={12} />
        </ShellPage>
      ),
    ]),
  ),
  "/db/materials": () => (
    <ShellPage width="max-w-7xl">
      <DatabaseTabs />
      <Hero icon={PackageCheck} title="Materials Directory" chips={4} />
      <FilterBar />
      <CardGrid count={18} />
    </ShellPage>
  ),
  "/db/characters": () => (
    <ShellPage width="max-w-7xl">
      <DatabaseTabs />
      <Hero icon={Users} title="Characters" />
      <FilterBar />
      <CardGrid count={18} />
    </ShellPage>
  ),
  "/db/weapons": () => (
    <ShellPage width="max-w-7xl">
      <DatabaseTabs />
      <Hero icon={Swords} title="Weapons" />
      <FilterBar />
      <CardGrid count={18} />
    </ShellPage>
  ),
  "/db/artifacts": () => (
    <ShellPage width="max-w-7xl">
      <DatabaseTabs />
      <Hero icon={Flower2} title="Artifact Sets" />
      <FilterBar />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <TextCards count={6} />
      </div>
    </ShellPage>
  ),
  "/versions": () => (
    <ShellPage width="max-w-4xl">
      <Hero icon={History} title="Release Notes" chips={2} />
      <TextCards count={3} />
    </ShellPage>
  ),
  "/about": () => (
    <ShellPage width="max-w-4xl">
      <Hero icon={Info} title="About GI Helper" />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextCards count={4} avatar />
      </div>
    </ShellPage>
  ),
  "/feedback": () => (
    <ShellPage width="max-w-3xl">
      <Hero icon={MessageSquareHeart} title="Feedback" chips={1} />
      <TextCards count={3} avatar />
    </ShellPage>
  ),
};

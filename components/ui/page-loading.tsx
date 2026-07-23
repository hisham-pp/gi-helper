import { cn } from "@/lib/utils";

export function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-lg bg-surface-variant/25",
        className,
      )}
    />
  );
}

export function DashboardPageLoading({
  view,
}: {
  view: "tracker" | "inventory" | "goals";
}) {
  if (view === "goals") {
    return <GoalsPageLoading />;
  }

  if (view === "inventory") {
    return <InventoryPageLoading />;
  }

  return <MaterialsPageLoading />;
}

export function MaterialsPageLoading() {
  return (
    <div className="space-y-8" aria-busy="true">
      <HeaderLoading titleWidth="w-48" descriptionWidth="w-96" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-24" />
        ))}
      </div>
      <div className="flex gap-2 border-b border-outline-variant pb-2">
        <SkeletonBlock className="h-11 w-32" />
        <SkeletonBlock className="h-11 w-32" />
      </div>
      <section className="rounded-lg border border-outline-variant bg-surface p-5 sm:p-6">
        <div className="flex flex-col gap-4 border-b border-outline-variant pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <SkeletonBlock className="h-7 w-48" />
            <SkeletonBlock className="h-4 w-72" />
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(18rem,1.5fr)_minmax(14rem,1fr)_auto] lg:w-[48rem]">
            <SkeletonBlock className="h-12" />
            <SkeletonBlock className="h-12" />
            <SkeletonBlock className="h-12 w-24" />
          </div>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_, index) => (
            <MaterialCardLoading key={index} />
          ))}
        </div>
      </section>
    </div>
  );
}

export function GoalsPageLoading() {
  return (
    <div className="space-y-8" aria-busy="true">
      <HeaderLoading titleWidth="w-56" descriptionWidth="w-80" />
      <section className="space-y-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <SkeletonBlock className="h-8 w-48" />
            <SkeletonBlock className="h-4 w-72" />
          </div>
          <div className="flex gap-2">
            <SkeletonBlock className="h-11 w-28" />
            <SkeletonBlock className="h-11 w-32" />
          </div>
        </div>
        <div className="rounded-lg border border-outline-variant bg-surface p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-12" />
            ))}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <GoalCardLoading key={index} />
          ))}
        </div>
      </section>
    </div>
  );
}

export function InventoryPageLoading() {
  return (
    <div className="space-y-8" aria-busy="true">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <HeaderLoading titleWidth="w-40" descriptionWidth="w-96" />
        <SkeletonBlock className="h-24 w-44" />
      </div>
      <div className="flex gap-2 border-b border-outline-variant pb-2">
        <SkeletonBlock className="h-11 w-32" />
        <SkeletonBlock className="h-11 w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <GoalCardLoading key={index} />
        ))}
      </div>
    </div>
  );
}

export function CharactersPageLoading() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(16rem,1fr)_8rem_8rem_9rem]">
        <SkeletonBlock className="h-12 sm:col-span-2 lg:col-span-1" />
        <SkeletonBlock className="h-12" />
        <SkeletonBlock className="h-12" />
        <SkeletonBlock className="h-12" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 15 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-lg border border-outline-variant p-3"
          >
            <SkeletonBlock className="h-10 w-10 flex-shrink-0" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-3/4" />
              <SkeletonBlock className="h-3 w-1/2" />
              <SkeletonBlock className="h-3 w-16" />
            </div>
            <SkeletonBlock className="h-8 w-8 flex-shrink-0 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CharacterDetailPageLoading() {
  return (
    <div className="space-y-8" aria-busy="true">
      <DetailHeaderLoading actions={5} avatarSize="h-14 w-14" />
      <div className="flex flex-wrap gap-2 border-b border-outline-variant">
        <SkeletonBlock className="mb-2 h-10 w-28" />
        <SkeletonBlock className="mb-2 h-10 w-32" />
        <SkeletonBlock className="mb-2 h-10 w-24" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="rounded-lg border border-outline-variant p-5">
          <SkeletonBlock className="aspect-square w-full" />
        </div>
        <div className="space-y-4 rounded-lg border border-outline-variant p-5">
          <SkeletonBlock className="h-7 w-52" />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-5/6" />
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-16" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function GoalDetailPageLoading() {
  return (
    <div className="space-y-8" aria-busy="true">
      <DetailHeaderLoading actions={2} />
      <section className="grid gap-8 lg:grid-cols-[0.95fr_1.4fr]">
        <div className="rounded-lg border border-outline-variant p-6">
          <SkeletonBlock className="h-7 w-44" />
          <SkeletonBlock className="mt-2 h-4 w-56" />
          <div className="mt-6 space-y-6">
            <SkeletonBlock className="h-12" />
            <SkeletonBlock className="h-20" />
            <SkeletonBlock className="h-11 w-full" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <SkeletonBlock className="h-4 w-32" />
              <SkeletonBlock className="h-4 w-12" />
            </div>
            <SkeletonBlock className="h-2 w-full" />
          </div>
          <div className="rounded-lg border border-outline-variant p-6">
            <SkeletonBlock className="h-6 w-48" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <MaterialRequirementLoading key={index} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function MaterialDetailPageLoading() {
  return (
    <div className="space-y-8" aria-busy="true">
      <DetailHeaderLoading avatarSize="h-16 w-16" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="rounded-lg border border-outline-variant p-5 sm:p-6">
          <SkeletonBlock className="h-7 w-32" />
          <div className="mt-3 space-y-2">
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-11/12" />
            <SkeletonBlock className="h-4 w-2/3" />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-20" />
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-outline-variant p-5 sm:p-6">
          <SkeletonBlock className="h-6 w-40" />
          <div className="mt-4 space-y-3">
            <SkeletonBlock className="h-16" />
            <SkeletonBlock className="h-16" />
          </div>
        </div>
        <div className="rounded-lg border border-outline-variant p-5 sm:p-6">
          <SkeletonBlock className="h-6 w-44" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <MaterialRequirementLoading key={index} />
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-outline-variant p-5 sm:p-6 lg:col-span-2">
          <SkeletonBlock className="h-6 w-28" />
          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-8 w-24 rounded-full" />
            ))}
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-24" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeaderLoading({
  titleWidth,
  descriptionWidth,
}: {
  titleWidth: string;
  descriptionWidth: string;
}) {
  return (
    <header>
      <SkeletonBlock className={cn("h-9", titleWidth)} />
      <SkeletonBlock className={cn("mt-3 h-5 max-w-full", descriptionWidth)} />
    </header>
  );
}

function DetailHeaderLoading({
  actions = 0,
  avatarSize = "h-14 w-14",
}: {
  actions?: number;
  avatarSize?: string;
}) {
  return (
    <div className="flex flex-wrap items-start gap-4">
      <SkeletonBlock className="h-10 w-10 flex-shrink-0" />
      <SkeletonBlock className={cn("flex-shrink-0", avatarSize)} />
      <div className="min-w-0 flex-1 space-y-3">
        <SkeletonBlock className="h-9 w-64 max-w-full" />
        <SkeletonBlock className="h-4 w-80 max-w-full" />
      </div>
      {actions > 0 ? (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: actions }).map((_, index) => (
            <SkeletonBlock key={index} className="h-10 w-28" />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MaterialCardLoading() {
  return (
    <div className="rounded-lg border border-outline-variant p-4">
      <div className="flex gap-4">
        <SkeletonBlock className="h-14 w-14 flex-shrink-0" />
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonBlock className="h-5 w-3/4" />
          <SkeletonBlock className="h-4 w-1/2" />
          <SkeletonBlock className="h-4 w-full" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <SkeletonBlock className="h-12" />
        <SkeletonBlock className="h-12" />
        <SkeletonBlock className="h-12" />
      </div>
    </div>
  );
}

function GoalCardLoading() {
  return (
    <div className="rounded-lg border border-outline-variant p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-3">
          <SkeletonBlock className="h-5 w-3/4" />
          <div className="flex gap-2">
            <SkeletonBlock className="h-5 w-20 rounded-full" />
            <SkeletonBlock className="h-5 w-16 rounded-full" />
          </div>
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-2/3" />
        </div>
        <SkeletonBlock className="h-8 w-8 flex-shrink-0 rounded-full" />
      </div>
      <div className="mt-5 space-y-2">
        <div className="flex justify-between">
          <SkeletonBlock className="h-4 w-20" />
          <SkeletonBlock className="h-4 w-10" />
        </div>
        <SkeletonBlock className="h-2 w-full" />
      </div>
      <div className="mt-4 flex justify-between border-t border-outline-variant pt-3">
        <SkeletonBlock className="h-4 w-24" />
        <SkeletonBlock className="h-4 w-28" />
      </div>
    </div>
  );
}

function MaterialRequirementLoading() {
  return (
    <div className="rounded-lg border border-outline-variant p-4">
      <div className="flex items-center gap-4">
        <SkeletonBlock className="h-12 w-12 flex-shrink-0" />
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonBlock className="h-5 w-3/4" />
          <SkeletonBlock className="h-4 w-1/2" />
        </div>
        <SkeletonBlock className="h-8 w-20" />
      </div>
      <SkeletonBlock className="mt-4 h-2 w-full" />
    </div>
  );
}

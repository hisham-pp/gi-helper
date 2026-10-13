export default function Loading() {
  return (
    // Shown below the shared top bar (app/(site)/layout.tsx), which stays in place
    <main className="flex-1 bg-transparent px-4 pb-6 pt-2 text-foreground sm:px-6 sm:pt-4 md:px-8">
      <div className="mx-auto max-w-7xl animate-pulse space-y-6">
        <div className="h-48 rounded-[32px] bg-slate-200 dark:bg-slate-800" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-28 rounded-3xl bg-slate-200 dark:bg-slate-800"
            />
          ))}
        </div>
        <div className="h-[30rem] rounded-3xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </main>
  );
}

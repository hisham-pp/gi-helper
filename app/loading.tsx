export default function Loading() {
  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
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

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";

export function PlaceholderPage({
  title,
  description,
  bullets,
  username
}: {
  title: string;
  description: string;
  bullets: string[];
  username: string;
}) {
  return (
    <AppShell title={title} description={description} userLabel={username}>
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-border bg-card/80 p-6 shadow-sm backdrop-blur dark:bg-slate-950/80">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Planned Scope</h2>
          <div className="mt-4 space-y-3">
            {bullets.map((bullet) => (
              <div key={bullet} className="rounded-2xl border border-border bg-white/50 px-4 py-3 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300">
                {bullet}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card/80 p-6 shadow-sm backdrop-blur dark:bg-slate-950/80">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Current Status</h2>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            This page is intentionally reserved so the route structure is ready before feature implementation begins.
          </p>
          <Link
            href="/materials"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-950"
          >
            Open material tracker
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </AppShell>
  );
}

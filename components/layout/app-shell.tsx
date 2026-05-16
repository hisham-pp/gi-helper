"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { Compass, Gem, Home, MoonStar, Shield, Sparkles, SunMedium, Swords, Target } from "lucide-react";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";

import { logoutAction } from "@/app/actions";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/materials", label: "Material Tracker", icon: Gem },
  { href: "/map", label: "Map", icon: Compass },
  { href: "/collectibles", label: "Collectibles", icon: Sparkles },
  { href: "/shrines", label: "Shrines", icon: Shield },
  { href: "/challenges", label: "Challenges", icon: Swords }
] satisfies Array<{ href: Route; label: string; icon: typeof Home }>;

export function AppShell({
  title,
  description,
  userLabel,
  children
}: Readonly<{
  title: string;
  description: string;
  userLabel?: string;
  children: ReactNode;
}>) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="overflow-hidden rounded-[32px] border border-white/40 bg-hero-grid bg-card/80 p-6 shadow-panel backdrop-blur dark:border-white/10 dark:bg-slate-950/80">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                <Target className="h-3.5 w-3.5" />
                Genshin Tracker Suite
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                {title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-300 sm:text-base">
                {description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {userLabel ? (
                <span className="rounded-full border border-white/60 bg-white px-4 py-2 text-sm text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
                  @{userLabel}
                </span>
              ) : null}
              <button
                className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                type="button"
              >
                {resolvedTheme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
                {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
              </button>
              {userLabel ? (
                <form action={logoutAction}>
                  <button
                    className="rounded-full border border-rose-300/70 bg-white px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:border-rose-900 dark:bg-white/10 dark:text-rose-300 dark:hover:bg-rose-950/30"
                    type="submit"
                  >
                    Logout
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        </header>

        <nav className="rounded-3xl border border-border bg-card/80 p-3 shadow-sm backdrop-blur dark:bg-slate-950/80">
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition",
                    active
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {children}
      </div>
    </main>
  );
}

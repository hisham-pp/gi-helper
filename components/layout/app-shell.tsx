"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { Compass, Gem, Home, MoonStar, Shield, Sparkles, SunMedium, Swords, Target, Download, LogOut, Upload } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { toast } from "sonner";

import { logoutAction } from "@/app/actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/materials", label: "Tracker", icon: Gem },
  { href: "/map", label: "Map", icon: Compass },
  { href: "/collectibles", label: "Items", icon: Sparkles },
  { href: "/shrines", label: "Shrines", icon: Shield },
  { href: "/challenges", label: "Combat", icon: Swords }
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
  const [mounted, setMounted] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  async function handleExportAll() {
    try {
      const response = await fetch("/api/export/all");

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const payload = await response.json();
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "genshin-material-tracker-all-data.json";
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("All data exported.");
    } catch (error) {
      console.error("Export all failed", error);
      toast.error("Unable to export all data.");
    }
  }

  async function handleImportAll(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const response = await fetch("/api/import/all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(parsed)
      });

      if (!response.ok) {
        throw new Error("Import failed");
      }

      toast.success("All data imported.");
      window.location.reload();
    } catch (error) {
      console.error("Import all failed", error);
      toast.error("Unable to import backup file.");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <main className="min-h-screen bg-background text-on-background">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-on-surface">{title}</h1>
                <p className="text-sm text-on-surface-variant">{description}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {userLabel && (
              <div className="mr-2 hidden rounded-full bg-secondary-container px-4 py-2 text-sm font-medium text-secondary-on-container md:block">
                @{userLabel}
              </div>
            )}
            <Button
              variant="tonal"
              className="h-10 w-10 p-0 rounded-full"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <SunMedium className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
            </Button>
            <Button variant="tonal" onClick={handleExportAll} className="gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button variant="tonal" onClick={() => importInputRef.current?.click()} className="gap-2">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Import</span>
            </Button>
            {userLabel && (
              <form action={logoutAction}>
                <Button variant="outlined" type="submit" className="border-error text-error hover:bg-error/5 active:bg-error/10">
                  <LogOut className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </form>
            )}
          </div>
        </header>

        <input ref={importInputRef} className="hidden" onChange={handleImportAll} type="file" accept="application/json" />

        <nav className="sticky top-4 z-40 flex items-center justify-center">
          <div className="flex w-full max-w-fit gap-1 rounded-full border border-outline-variant bg-surface/80 p-1.5 shadow-lg backdrop-blur-md">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-on-surface-variant hover:bg-surface-variant hover:text-on-surface"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className={cn("hidden md:inline", active ? "inline" : "hidden group-hover:inline")}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="flex-1 pb-10">{children}</div>
      </div>
    </main>
  );
}

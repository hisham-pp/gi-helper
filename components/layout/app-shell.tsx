"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import {
  Compass,
  Gem,
  Home,
  MoonStar,
  Shield,
  Sparkles,
  SunMedium,
  Swords,
  Target,
  Download,
  LogOut,
  Upload,
  Menu,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
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
  { href: "/challenges", label: "Combat", icon: Swords },
] satisfies Array<{ href: Route; label: string; icon: typeof Home }>;

export function AppShell({
  userLabel,
  userRole,
  children,
}: Readonly<{
  userLabel?: string;
  userRole?: string;
  children: ReactNode;
}>) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close sidebar on navigation
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const isDark = mounted && resolvedTheme === "dark";

  async function handleExportAll() {
    try {
      const response = await fetch("/api/export/all");
      if (!response.ok) throw new Error("Export failed");
      const payload = await response.json();
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
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
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const response = await fetch("/api/import/all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      if (!response.ok) throw new Error("Import failed");
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
    <div className="flex h-screen overflow-hidden bg-background text-on-background">
      {/* Mobile Top App Bar */}
      <header className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-outline-variant bg-surface/80 px-4 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          <Button
            variant="text"
            className="h-10 w-10 p-0"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            <span className="font-bold tracking-tight">GMT</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="text"
            className="h-10 w-10 rounded-full p-0"
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {isDark ? (
              <SunMedium className="h-5 w-5" />
            ) : (
              <MoonStar className="h-5 w-5" />
            )}
          </Button>
        </div>
      </header>

      {/* Sidebar / Navigation Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-outline-variant bg-surface transition-transform duration-300 lg:static lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 lg:h-20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
              <Target className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-on-surface truncate text-lg font-bold tracking-tight">
                Genshin Tracker
              </h1>
              <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">
                Material Suite
              </p>
            </div>
          </div>
          <Button
            variant="text"
            className="h-10 w-10 p-0 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          <div className="text-on-surface-variant mb-4 px-3 text-[11px] font-bold uppercase tracking-wider opacity-60">
            Navigation
          </div>
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex h-12 items-center gap-3 rounded-full px-4 text-sm font-medium transition-all",
                  active
                    ? "text-on-primary-container bg-primary-container"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5",
                    active
                      ? "text-primary"
                      : "text-on-surface-variant group-hover:text-on-surface",
                  )}
                />
                {item.label}
              </Link>
            );
          })}

          <div className="mx-3 my-6 border-t border-outline-variant" />

          {userRole === "master" && (
            <>
              <div className="text-on-surface-variant mb-4 px-3 text-[11px] font-bold uppercase tracking-wider opacity-60">
                Tools & Actions
              </div>
              <button
                onClick={handleExportAll}
                className="text-on-surface-variant hover:text-on-surface flex h-12 w-full items-center gap-3 rounded-full px-4 text-sm font-medium transition-all hover:bg-surface-variant"
              >
                <Download className="h-5 w-5" />
                Export All Data
              </button>
              <button
                onClick={() => importInputRef.current?.click()}
                className="text-on-surface-variant hover:text-on-surface flex h-12 w-full items-center gap-3 rounded-full px-4 text-sm font-medium transition-all hover:bg-surface-variant"
              >
                <Upload className="h-5 w-5" />
                Import Backup
              </button>
            </>
          )}
        </nav>

        <div className="border-t border-outline-variant p-4">
          {userLabel && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 px-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container font-bold text-secondary-on-container">
                  {userLabel[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-on-surface truncate text-sm font-bold">
                    @{userLabel}
                  </p>
                  <p className="text-on-surface-variant truncate text-xs">
                    Standard Plan
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="tonal"
                  className="hidden h-10 flex-1 gap-2 rounded-full lg:flex"
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                >
                  {isDark ? (
                    <SunMedium className="h-4 w-4" />
                  ) : (
                    <MoonStar className="h-4 w-4" />
                  )}
                  {isDark ? "Light" : "Dark"}
                </Button>
                <form action={logoutAction} className="flex flex-1">
                  <Button
                    variant="outlined"
                    type="submit"
                    className="h-10 flex-1 border-error text-error hover:bg-error/5"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="bg-scrim/30 fixed inset-0 z-40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="min-w-0 flex-1 overflow-y-auto pt-16 lg:pt-0">
        <input
          ref={importInputRef}
          className="hidden"
          onChange={handleImportAll}
          type="file"
          accept="application/json"
        />
        <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

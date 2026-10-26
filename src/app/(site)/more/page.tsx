import type { Metadata } from "next";
import { ShellLink } from "@/components/layout/ShellLink";
import {
  Settings,
  Info,
  MessageSquareHeart,
  History,
  ChevronRight,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import { pageMetadata } from "@/lib/seo";
import { getLatestVersion } from "@/lib/versions";
import type { Route } from "next";

export const metadata: Metadata = pageMetadata({
  title: "More",
  description:
    "Settings, about, feedback, release notes and more for GI Helper.",
  path: "/more",
});

interface MoreMenuItem {
  href: Route;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Accent colour class for the icon chip. */
  accent: string;
}

const MENU_ITEMS: MoreMenuItem[] = [
  {
    href: "/guides" as Route,
    label: "Guides & Tutorials",
    description: "Kamera alternative, GOOD export, and video scanning guides",
    icon: BookOpen,
    accent: "text-cyan-300",
  },
  {
    href: "/settings" as Route,
    label: "Settings",
    description: "AI providers, models and scan preferences",
    icon: Settings,
    accent: "text-amber-300",
  },
  {
    href: "/about" as Route,
    label: "About us",
    description: "What GI Helper is, how it works and your data",
    icon: Info,
    accent: "text-cyan-300",
  },
  {
    href: "/feedback" as Route,
    label: "Feedback",
    description: "Share ideas, report bugs or say hi",
    icon: MessageSquareHeart,
    accent: "text-rose-300",
  },
  {
    href: "/versions" as Route,
    label: "Release Notes",
    description: "What changed in each version",
    icon: History,
    accent: "text-emerald-300",
  },
];

export default function MorePage() {
  const latest = getLatestVersion();

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-start px-4 pb-4 pt-2 sm:px-6 sm:pt-4 md:px-8 md:pb-8">
      <main className="w-full max-w-lg space-y-4 pb-12">
        {/* Page header */}
        <div className="px-1 pb-1">
          <h1 className="text-xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-2xl">
            More
          </h1>
          <p className="mt-1 text-xs text-white/60">
            Settings, info and everything else.
          </p>
        </div>

        {/* Menu list */}
        <div className="space-y-2">
          {MENU_ITEMS.map(({ href, label, description, icon: Icon, accent }) => (
            <ShellLink
              key={href}
              href={href}
              className="glass-card group flex items-center gap-4 p-4 transition-all duration-200 hover:scale-[1.01] active:scale-[0.98]"
            >
              <span
                className={`glass-chip flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${accent}`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-white">
                  {label}
                </span>
                <span className="block text-xs leading-relaxed text-white/60">
                  {description}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-white/30 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-white/50" />
            </ShellLink>
          ))}
        </div>

        {/* Version footer */}
        {latest && (
          <p className="px-1 text-center text-[11px] text-white/40">
            GI Helper{" "}
            <span className="font-mono font-semibold">v{latest.version}</span>
          </p>
        )}
      </main>
    </div>
  );
}

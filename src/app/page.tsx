import { Scanner } from "@/components/scanner/Scanner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ScannerSettingsButton } from "@/components/scanner/ScannerSettingsButton";
import Link from "next/link";

export default function ScannerPage() {
  return (
    <div className="relative z-10 flex min-h-screen w-full flex-col bg-transparent px-4 py-4 sm:px-6 md:px-8">
      {/* Top Header Bar */}
      <header className="flex w-full shrink-0 items-center justify-between pb-3 sm:pb-4">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl border border-white/10 bg-white/10 shadow-sm backdrop-blur-md">
            <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)]" />
          </span>
          <span className="text-xs sm:text-sm font-bold tracking-tight text-white drop-shadow-sm">
            GI Helper
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/materials"
            className="text-on-surface flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1 sm:px-3.5 sm:py-1.5 text-xs font-bold shadow-sm backdrop-blur-md transition-all hover:scale-105 hover:bg-white/20 active:scale-95"
          >
            <span>Materials</span>
          </Link>
          <ScannerSettingsButton />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Scanner Container - Supports Natural Scrolling for Results */}
      <main className="flex flex-1 w-full flex-col items-center justify-start pb-12">
        <Scanner />
      </main>
    </div>
  );
}


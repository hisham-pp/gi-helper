import { Scanner } from "@/components/scanner/Scanner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ScannerSettingsButton } from "@/components/scanner/ScannerSettingsButton";
import Link from "next/link";
import { Bug } from "lucide-react";

export default function ScannerPage() {
  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-start bg-transparent p-4 pt-12 md:p-8">
      <div className="absolute right-4 top-4 flex items-center gap-3 md:right-8 md:top-8">
        <Link
          href="/materials"
          className="text-on-surface flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold shadow-sm backdrop-blur-md transition-all hover:scale-105 hover:bg-white/20 active:scale-95 sm:text-sm"
        >
          <span>Materials</span>
        </Link>
        <ScannerSettingsButton />
        <ThemeToggle />
      </div>
      <Scanner />
    </div>
  );
}

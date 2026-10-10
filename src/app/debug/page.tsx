import { ScannerDebugger } from "@/components/scanner/debug/ScannerDebugger";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scanner Debugger | Genshin Material Tracker",
  description:
    "Computer Vision & OCR Diagnostic Suite for Genshin Impact Inventory Scanner",
};

export default function ScannerDebugPage() {
  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-start bg-transparent p-4 pt-8 md:p-8">
      {/* Top Navigation Bar */}
      <div className="mb-6 flex w-full max-w-7xl items-center justify-between">
        <Link
          href="/"
          className="text-on-surface flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold shadow-sm backdrop-blur-md transition-all hover:scale-105 hover:bg-white/20 active:scale-95 sm:text-sm"
        >
          <ArrowLeft className="h-4 w-4 text-primary" />
          <span>Back to Scanner</span>
        </Link>

        <div className="flex gap-4 items-center">
          <Link
            href="/debug/test-builder"
            className="text-on-surface flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold shadow-sm backdrop-blur-md transition-all hover:scale-105 hover:bg-white/20 active:scale-95 sm:text-sm"
          >
            <span>Test Builder</span>
          </Link>
          <ThemeToggle />
        </div>
      </div>

      {/* Debugger Suite Container */}
      <ScannerDebugger />
    </div>
  );
}

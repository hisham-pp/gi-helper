import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ScannerSettingsButton } from "@/components/scanner/ScannerSettingsButton";
import { HeaderNav, VersionChip } from "./HeaderNav";

interface SiteHeaderProps {
  /** Current release, shown as a chip linking to the release notes. */
  version?: string;
}

/**
 * Top bar shared by every public page (rendered by app/(site)/layout.tsx).
 * It lives in the layout, so it stays mounted and in place when switching
 * pages; only the nav thumb moves to the current page.
 */
export function SiteHeader({ version }: SiteHeaderProps) {
  return (
    <header className="flex w-full shrink-0 items-center justify-between px-4 pb-3 pt-4 sm:px-6 sm:pb-4 md:px-8">
      <div className="flex items-center gap-2 sm:gap-2.5">
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5" aria-label="GI Helper home">
          <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl border border-white/10 bg-white/10 shadow-sm backdrop-blur-md">
            <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)]" />
          </span>
          <span className="whitespace-nowrap text-xs sm:text-sm font-bold tracking-tight text-white drop-shadow-sm">
            GI Helper
          </span>
        </Link>
        {version && <VersionChip version={version} />}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <HeaderNav />
        <ScannerSettingsButton />
        <ThemeToggle />
      </div>
    </header>
  );
}

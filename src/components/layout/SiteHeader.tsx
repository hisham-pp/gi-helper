import { ShellLink } from "@/components/layout/ShellLink";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ScannerSettingsButton } from "@/components/scanner/ScannerSettingsButton";
import { BrandIcon } from "./BrandIcon";
import { HeaderNav, VersionChip } from "./HeaderNav";

interface SiteHeaderProps {
  /** Current release, shown as a chip linking to the release notes. */
  version?: string;
}

/**
 * Top bar shared by every public page (rendered by app/(site)/layout.tsx).
 * It lives in the layout, so it stays mounted and in place when switching
 * pages; only the nav thumb moves to the current page. On phones the page
 * links get their own full-width row under the logo; from `sm` it's one row.
 */
export function SiteHeader({ version }: SiteHeaderProps) {
  return (
    <header className="flex w-full shrink-0 flex-nowrap items-center gap-x-2 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top,1rem))] sm:gap-x-3 sm:px-6 sm:pb-4 md:px-8">
      <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
        <ShellLink href="/" className="flex items-center gap-2 sm:gap-2.5" aria-label="GI Helper – Genshin Inventory Scanner Home">
          <BrandIcon className="h-7 w-7 drop-shadow-[0_0_10px_rgba(45,212,191,0.35)] sm:h-8 sm:w-8" />
          <span className="whitespace-nowrap text-xs sm:text-sm font-bold tracking-tight text-white drop-shadow-sm">
            GI Helper
          </span>
        </ShellLink>
        {version && <VersionChip version={version} />}
      </div>

      {/* Phones: hidden because mobile uses the fixed bottom navigation dock; from sm: right, beside the buttons */}
      <div className="hidden sm:block sm:ml-auto sm:w-auto">
        <HeaderNav />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:ml-0 sm:gap-3">
        {/* Mobile users can open app settings from the More page in the bottom dock. */}
        <div className="hidden sm:block">
          <ScannerSettingsButton />
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}

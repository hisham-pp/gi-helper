import { FooterNav } from "./FooterNav";
import { ScanCounter } from "./ScanCounter";

/**
 * Footer shared by every public page (rendered by app/(site)/layout.tsx).
 * On the home page it also shows the scan counter, in the same row so the
 * page doesn't grow.
 */
export function SiteFooter() {
  return (
    <footer className="w-full shrink-0 px-4 pb-6 pt-2 sm:px-6 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-x-4 gap-y-2 text-xs text-white/50 sm:flex-row">
        <p>Unofficial fan project. Not affiliated with HoYoverse.</p>
        <ScanCounter />
        <FooterNav />
      </div>
    </footer>
  );
}

import { SiteFooter } from "@/components/layout/SiteFooter";
import { PageShellSlot } from "@/components/layout/PageShellSlot";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { getLatestVersion } from "@/lib/versions";

/**
 * Layout for the public pages (scanner, materials, release notes). Layouts stay
 * mounted across navigations, so the top bar never re-renders or moves when
 * switching pages; only the page below it changes. /debug stays outside.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const latestVersion = getLatestVersion();

  return (
    // dvh, not vh: on phones 100vh is taller than the visible area while the
    // browser bars show, which made every page scroll a little
    <div className="relative z-10 flex min-h-screen w-full flex-col supports-[min-height:100dvh]:min-h-dvh pb-20 sm:pb-0 overflow-x-clip">
      <SiteHeader version={latestVersion?.version} />
      <PageShellSlot>{children}</PageShellSlot>
      <SiteFooter />
      <MobileBottomNav />
    </div>
  );
}

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getLatestVersion } from "@/lib/versions";

/**
 * Layout for the public pages (scanner, materials, release notes). Layouts stay
 * mounted across navigations, so the top bar never re-renders or moves when
 * switching pages; only the page below it changes. /debug stays outside.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const latestVersion = getLatestVersion();

  return (
    <div className="relative z-10 flex min-h-screen w-full flex-col">
      <SiteHeader version={latestVersion?.version} />
      {children}
      <SiteFooter />
    </div>
  );
}

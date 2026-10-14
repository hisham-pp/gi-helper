import Link from "next/link";

/** Footer shared by every public page (rendered by app/(site)/layout.tsx). */
export function SiteFooter() {
  return (
    <footer className="w-full shrink-0 px-4 pb-6 pt-2 sm:px-6 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 text-xs text-white/50 sm:flex-row">
        <p>Unofficial fan project. Not affiliated with HoYoverse.</p>
        <nav aria-label="Footer" className="flex items-center gap-4">
          <Link href="/feedback" className="transition-colors hover:text-white/85">
            Feedback
          </Link>
          <Link href="/about" className="transition-colors hover:text-white/85">
            About us
          </Link>
          <Link href="/versions" className="transition-colors hover:text-white/85">
            Release notes
          </Link>
        </nav>
      </div>
    </footer>
  );
}

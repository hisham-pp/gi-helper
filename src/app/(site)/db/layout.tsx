import { DatabaseNav } from "@/components/database/DatabaseNav";

/**
 * The database section (/db/materials, /db/characters, /db/weapons,
 * /db/artifacts). A layout stays mounted while you switch between them, so
 * DatabaseNav's highlight slides to the new page; ./template.tsx animates the
 * page itself.
 */
export default function DatabaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-start px-4 pb-4 pt-2 sm:px-6 sm:pt-4 md:px-8 md:pb-8">
      <div className="flex w-full max-w-7xl flex-1 flex-col gap-6">
        <DatabaseNav />
        {children}
      </div>
    </div>
  );
}

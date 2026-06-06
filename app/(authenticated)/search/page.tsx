import { Search } from "lucide-react";
import { SearchManager } from "@/components/dashboard/search-manager";

export default function GlobalSearchPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-primary-container p-2">
          <Search className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-on-surface text-3xl font-bold tracking-tight">
            Search
          </h1>
          <p className="text-on-surface-variant mt-1">
            Search across characters, materials, goals, and recipes.
          </p>
        </div>
      </div>

      <SearchManager />
    </div>
  );
}

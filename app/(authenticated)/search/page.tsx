import { getCurrentUser } from "@/lib/auth";
import { Search } from "lucide-react";
import { getDashboardData } from "@/lib/data";
import { SearchManager } from "@/components/dashboard/search-manager";
import { getAllCharacters } from "@/lib/static-data";

export default async function GlobalSearchPage() {
  const user = await getCurrentUser();
  const dashboardData = await getDashboardData(user?.id);

  const characters = getAllCharacters();

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
            Search across characters, materials, and goals.
          </p>
        </div>
      </div>

      <SearchManager
        characters={characters}
        materials={dashboardData.materials}
      />
    </div>
  );
}

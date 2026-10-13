import type { Metadata } from "next";
import { MaterialList } from "@/components/materials/MaterialList";
import materials from "@/data/materials.json";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "All Genshin Impact Materials",
  description: `Browse all ${materials.length} Genshin Impact materials in in-game inventory order: ascension gems, talent books, weapon materials, enemy and boss drops, and local specialties.`,
  path: "/materials",
});

export default function MaterialsPage() {
  return <MaterialList />;
}

import type { Metadata } from "next";
import { MaterialList } from "@/components/materials/MaterialList";
import materials from "@/data/materials.json";
import otherMaterials from "@/data/other-materials.json";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "All Genshin Impact Materials",
  description: `Browse all ${materials.length + otherMaterials.length} Genshin Impact materials in in-game inventory order: ascension gems, talent books, weapon materials, enemy and boss drops, local specialties, cooking ingredients, fish, ores and wood.`,
  path: "/materials",
});

export default function MaterialsPage() {
  return <MaterialList />;
}

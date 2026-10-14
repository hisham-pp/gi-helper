import type { Metadata } from "next";
import { MaterialList } from "@/components/materials/MaterialList";
import materials from "@/data/materials.json";
import otherMaterials from "@/data/other-materials.json";
import { getDirectoryMaterials } from "@/lib/materials";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "All Genshin Impact Materials",
  description: `Browse all ${materials.length + otherMaterials.length} Genshin Impact materials in in-game inventory order: ascension gems, talent books, weapon materials, enemy and boss drops, local specialties, cooking ingredients, fish, ores and wood.`,
  path: "/db/materials",
});

export default function MaterialsPage() {
  // Without descriptions: they're most of the catalogs' bytes, and the page
  // loads them on demand (/api/material-descriptions)
  const list = getDirectoryMaterials().map((m) => ({ ...m, description: "" }));
  return <MaterialList materials={list} />;
}

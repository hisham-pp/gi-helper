import type { Metadata } from "next";
import { ScannedInventory } from "@/components/scanner/ScannedInventory";
import { getDirectoryMaterials } from "@/lib/materials";

export const metadata: Metadata = {
  title: "Inventory",
  description:
    "Your Genshin Impact materials, characters, weapons and artifacts, saved in this browser. Import and export GOOD files.",
  // Each visitor's own list, kept in their browser: nothing to index
  robots: { index: false, follow: true },
};

export default function InventoryMaterialsPage() {
  // Without descriptions (the inventory doesn't show them): a fraction of the bytes
  const catalog = getDirectoryMaterials().map((m) => ({ ...m, description: "" }));
  return <ScannedInventory catalog={catalog} />;
}

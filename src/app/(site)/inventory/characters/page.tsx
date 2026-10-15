import type { Metadata } from "next";
import { CharactersInventory } from "@/components/inventory/CharactersInventory";

export const metadata: Metadata = {
  title: "Characters · Inventory",
  // Each visitor's own list, kept in their browser: nothing to index
  robots: { index: false, follow: true },
};

export default function InventoryCharactersPage() {
  return <CharactersInventory />;
}

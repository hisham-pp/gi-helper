import type { Metadata } from "next";
import { WeaponsInventory } from "@/components/inventory/WeaponsInventory";

export const metadata: Metadata = {
  title: "Weapons · Inventory",
  // Each visitor's own list, kept in their browser: nothing to index
  robots: { index: false, follow: true },
};

export default function InventoryWeaponsPage() {
  return <WeaponsInventory />;
}

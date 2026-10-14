import type { Metadata } from "next";
import { InventoryPage } from "@/components/inventory/InventoryPage";

export const metadata: Metadata = {
  title: "Inventory",
  description:
    "Your Genshin Impact materials, characters, weapons and artifacts, saved in this browser. Import and export GOOD files.",
  // Each visitor's own list, kept in their browser: nothing to index
  robots: { index: false, follow: true },
};

export default function Inventory() {
  return <InventoryPage />;
}

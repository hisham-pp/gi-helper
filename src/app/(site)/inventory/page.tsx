import type { Metadata } from "next";
import { ScannedInventory } from "@/components/scanner/ScannedInventory";

export const metadata: Metadata = {
  title: "Scanned Inventory",
  description:
    "Your scanned Genshin Impact materials, saved in this browser. Adjust quantities and export to GOOD.",
  // Each visitor's own list, kept in their browser: nothing to index
  robots: { index: false, follow: true },
};

export default function InventoryPage() {
  return <ScannedInventory />;
}

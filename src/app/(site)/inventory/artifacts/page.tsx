import type { Metadata } from "next";
import { ArtifactsInventory } from "@/components/inventory/ArtifactsInventory";

export const metadata: Metadata = {
  title: "Artifacts · Inventory",
  // Each visitor's own list, kept in their browser: nothing to index
  robots: { index: false, follow: true },
};

export default function InventoryArtifactsPage() {
  return <ArtifactsInventory />;
}

import type { Metadata } from "next";
import { MaterialList } from "@/components/materials/MaterialList";

export const metadata: Metadata = {
  title: "Materials Directory | Genshin Material Tracker",
  description:
    "Complete list of all available Genshin Impact materials in canonical in-game inventory order.",
};

export default function MaterialsPage() {
  return <MaterialList />;
}

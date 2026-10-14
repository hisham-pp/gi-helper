import materialsData from "@/data/materials.json";
import { MaterialItem } from "./types";

// Helpers without the catalog live in ./material-ui; client code that doesn't
// need getAllMaterials() should import them from there.
export * from "./material-ui";

/**
 * Returns all materials guaranteed sorted by canonical application order.
 */
export function getAllMaterials(): MaterialItem[] {
  return (materialsData as MaterialItem[])
    .slice()
    .sort((a, b) => a.order - b.order);
}

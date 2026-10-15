import type { Metadata } from "next";
import { WeaponList } from "@/components/database/WeaponList";
import weapons from "@/data/weapons.json";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "All Genshin Impact Weapons",
  description: `Browse all ${weapons.length} Genshin Impact weapons with their base ATK and substat at max level and their passive, by type and rarity.`,
  path: "/db/weapons",
});

export default function WeaponsPage() {
  return <WeaponList />;
}

import type { Metadata } from "next";
import { CharacterList } from "@/components/database/CharacterList";
import characters from "@/data/characters.json";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "All Genshin Impact Characters",
  description: `Browse all ${characters.length} playable Genshin Impact characters by element, weapon, region and rarity.`,
  path: "/db/characters",
});

export default function CharactersPage() {
  return <CharacterList />;
}

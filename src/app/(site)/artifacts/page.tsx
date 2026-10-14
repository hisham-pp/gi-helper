import type { Metadata } from "next";
import { ArtifactSetList } from "@/components/database/ArtifactSetList";
import artifactSets from "@/data/artifact-sets.json";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "All Genshin Impact Artifact Sets",
  description: `Browse all ${artifactSets.length} Genshin Impact artifact sets with their pieces and 2-piece and 4-piece bonuses.`,
  path: "/artifacts",
});

export default function ArtifactsPage() {
  return <ArtifactSetList />;
}

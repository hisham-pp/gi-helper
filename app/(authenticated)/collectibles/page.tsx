import { PlaceholderPage } from "@/components/dashboard/placeholder-page";

export default async function CollectiblesPage() {
  return (
    <PlaceholderPage
      title="Collectibles"
      description="Reserved for Hydroculus, Dendroculus, Lumenspar, and similar collectible progression systems."
      username="Traveler"
      bullets={[
        "Track collected and missing oculi by region",
        "Support Lumenspar and other progression collectibles",
        "Future map-linked collectible status and filtering",
      ]}
    />
  );
}

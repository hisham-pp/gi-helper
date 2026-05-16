import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { requireUser } from "@/lib/auth";

export default async function CollectiblesPage() {
  const user = await requireUser();

  return (
    <PlaceholderPage
      title="Collectibles"
      description="Reserved for Hydroculus, Dendroculus, Lumenspar, and similar collectible progression systems."
      username={user.username}
      bullets={[
        "Track collected and missing oculi by region",
        "Support Lumenspar and other progression collectibles",
        "Future map-linked collectible status and filtering",
      ]}
    />
  );
}

import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { requireUser } from "@/lib/auth";

export default async function MapPage() {
  const user = await requireUser();

  return (
    <PlaceholderPage
      title="Map"
      description="Future map tools for route planning, special nodes, and regional exploration systems."
      username={user.username}
      bullets={[
        "Interactive world map with custom markers and route layers",
        "Support for region-specific special items and farming routes",
        "Future integration with collectibles, shrines, and exploration progress"
      ]}
    />
  );
}

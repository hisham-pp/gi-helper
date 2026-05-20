import { PlaceholderPage } from "@/components/dashboard/placeholder-page";

export default async function ShrinesPage() {
  return (
    <PlaceholderPage
      title="Shrines"
      description="Reserved for shrine tracking, completion state, and future region-by-region exploration tools."
      username="Traveler"
      bullets={[
        "Track discovered shrine locations",
        "Store open or unopened shrine state per user",
        "Future integration with map pins and region summaries",
      ]}
    />
  );
}

import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { requireUser } from "@/lib/auth";

export default async function ShrinesPage() {
  const user = await requireUser();

  return (
    <PlaceholderPage
      title="Shrines"
      description="Reserved for shrine tracking, completion state, and future region-by-region exploration tools."
      username={user.username}
      bullets={[
        "Track discovered shrine locations",
        "Store open or unopened shrine state per user",
        "Future integration with map pins and region summaries"
      ]}
    />
  );
}

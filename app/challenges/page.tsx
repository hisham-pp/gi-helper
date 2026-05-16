import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { requireUser } from "@/lib/auth";

export default async function ChallengesPage() {
  const user = await requireUser();

  return (
    <PlaceholderPage
      title="Challenges"
      description="Reserved for general challenge mechanics and one-off challenge systems you want to track later."
      username={user.username}
      bullets={[
        "General challenge and puzzle completion tracking",
        "Support for single-instance or one-time challenge mechanics",
        "Future challenge grouping by region, area, or category"
      ]}
    />
  );
}

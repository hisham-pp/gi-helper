import { PlaceholderPage } from "@/components/dashboard/placeholder-page";

export default async function ChallengesPage() {
  return (
    <PlaceholderPage
      title="Challenges"
      description="Reserved for general challenge mechanics and one-off challenge systems you want to track later."
      username="Traveler"
      bullets={[
        "General challenge and puzzle completion tracking",
        "Support for single-instance or one-time challenge mechanics",
        "Future challenge grouping by region, area, or category",
      ]}
    />
  );
}

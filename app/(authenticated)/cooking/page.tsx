import { CookingPage } from "@/components/dashboard/cooking/cooking-page";
import { getCurrentUser } from "@/lib/auth";
import { getCookingData } from "@/lib/cooking-data";

export default async function CookingRoute() {
  const user = await getCurrentUser();
  const data = await getCookingData(user?.id);

  return <CookingPage initialData={data} />;
}

import { CookingPage } from "@/components/dashboard/cooking/cooking-page";
import { requireUser } from "@/lib/auth";
import { getCookingData } from "@/lib/cooking-data";

export default async function CookingRoute() {
  const user = await requireUser();
  const data = await getCookingData(user.id);

  return <CookingPage initialData={data} />;
}

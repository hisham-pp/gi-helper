import { WeaponDetailClientPage } from "@/components/weapons/weapon-detail-client-page";

export default async function WeaponDetailPage({
  params,
}: {
  params: Promise<{ weaponId: string }>;
}) {
  const { weaponId } = await params;

  return <WeaponDetailClientPage weaponId={weaponId} />;
}

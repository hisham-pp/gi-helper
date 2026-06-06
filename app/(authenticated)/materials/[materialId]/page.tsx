import { MaterialDetailClientPage } from "@/components/dashboard/materials/material-detail-client-page";

export default async function MaterialDetailPage({
  params,
}: {
  params: Promise<{ materialId: string }>;
}) {
  const { materialId } = await params;

  return <MaterialDetailClientPage materialId={materialId} />;
}

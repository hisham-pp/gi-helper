import { requireMaster } from "@/lib/auth";
import IconGrid from "@/components/material-icon-grid";

const externalIconUrl = (iconName: string) =>
  `https://enka.network/ui/${iconName}.png`;

const ranges = [
  { label: "Local Specialties", start: 100001, end: 100054 },
  { label: "Talent Books", start: 104301, end: 104345 },
  { label: "Enemy / Elite Drops", start: 112001, end: 112070 },
];

const allIconNames = ranges.flatMap(({ start, end }) =>
  Array.from(
    { length: end - start + 1 },
    (_, index) => `UI_ItemIcon_${String(start + index).padStart(6, "0")}`,
  ),
);

const icons = allIconNames.map((iconName) => ({
  id: iconName,
  name: iconName,
  image: externalIconUrl(iconName),
  iconName,
}));

export default async function IconsPage() {
  await requireMaster();

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Material Icons</h1>
      <p className="text-on-surface-variant mb-6">
        Listing all external icon IDs in the known ranges. Click an icon to copy
        its icon name for editing.
      </p>
      {/* IconGrid is a client component */}
      <IconGrid items={icons} />
    </div>
  );
}

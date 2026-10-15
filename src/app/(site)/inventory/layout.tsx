import { InventoryShell } from "@/components/inventory/InventoryShell";

/**
 * The inventory section (/inventory/materials, /characters, /weapons,
 * /artifacts): header, links between them and GOOD import/export stay
 * mounted while you switch; ./template.tsx animates the page itself.
 */
export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return <InventoryShell>{children}</InventoryShell>;
}

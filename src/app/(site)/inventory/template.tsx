import { PageTransition } from "@/components/layout/PageTransition";

/**
 * Remounts on every switch between inventory pages (the (site) template only
 * remounts when you leave /inventory), so each one still plays the page entrance.
 */
export default function InventoryTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}

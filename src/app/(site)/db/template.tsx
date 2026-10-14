import { PageTransition } from "@/components/layout/PageTransition";

/**
 * Remounts on every switch between database pages (the (site) template only
 * remounts when you leave /db), so each one still plays the page entrance.
 */
export default function DatabaseTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}

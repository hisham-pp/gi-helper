import { PageTransition } from "@/components/layout/PageTransition";

/**
 * Unlike the layout, a template remounts on every navigation, so each page
 * switch replays the squash-and-stretch entrance.
 */
export default function SiteTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageTransition>{children}</PageTransition>;
}

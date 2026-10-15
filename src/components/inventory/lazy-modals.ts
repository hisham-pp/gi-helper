import dynamic from "next/dynamic";

/*
 * Inventory modals load on demand: their code stays out of the page bundle
 * and they only mount while open.
 */

const loadImportGOODModal = () => import("./ImportGOODModal");

export const LazyImportGOODModal = dynamic(
  () => loadImportGOODModal().then((m) => m.ImportGOODModal),
  { ssr: false },
);

export function preloadImportGOODModal(): void {
  // A failed preload is retried by the real open, which surfaces the error.
  loadImportGOODModal().catch(() => {});
}

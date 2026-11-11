// /db redirects to /db/materials via next.config.ts (permanent: true).
// This page-level redirect is a safety net for environments where the
// config-level redirect hasn't taken effect yet.
import { redirect } from "next/navigation";

export default function DbPage() {
  redirect("/db/materials");
}

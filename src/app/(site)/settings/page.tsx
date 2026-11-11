import type { Metadata } from "next";
import { ScannerSettingsContent } from "@/components/scanner/ScannerSettingsContent";

export const metadata: Metadata = {
  title: "Scanner Settings",
  description:
    "Configure AI Vision providers, models, API credentials, and workflow preferences for GI Helper.",
  // Settings are user-specific UI with no static content to index.
  robots: { index: false, follow: false },
};

export default function SettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-3 py-3 sm:px-6 sm:py-6">
      <div className="glass-card glass-card--lg glass-card--raised overflow-hidden rounded-3xl text-white">
        <ScannerSettingsContent isPage={true} />
      </div>
    </div>
  );
}

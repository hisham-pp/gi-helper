"use client";

import React from "react";
import { Settings, X, Grid, CheckCircle2 } from "lucide-react";
import { useScannerSettings } from "@/lib/scanner-settings";

interface ScannerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScannerSettingsModal({
  isOpen,
  onClose,
}: ScannerSettingsModalProps) {
  const { settings, updateSetting, mounted } = useScannerSettings();

  if (!isOpen || !mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-[2rem] border-[0.5px] border-b-white/5 border-l-white/20 border-r-white/5 border-t-white/30 bg-gradient-to-br from-neutral-900/90 via-neutral-900/80 to-black/95 p-6 text-white shadow-[0_16px_48px_0_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-2xl sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-white/10 bg-primary/20 p-2 text-primary shadow-inner">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white drop-shadow-sm">
                Scanner Settings
              </h2>
              <p className="text-xs text-white/60">
                Configure auto-previews and review behaviors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 transition-colors hover:bg-white/15 hover:text-white"
            aria-label="Close settings"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Options List */}
        <div className="my-6 space-y-5">
          {/* Option 1: Auto Preview Layout */}
          <div className="group flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-all hover:border-white/20 hover:bg-white/[0.07]">
            <div className="flex gap-3.5">
              <div className="mt-0.5 rounded-lg border border-white/10 bg-white/10 p-2 text-primary">
                <Grid className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="toggle-auto-preview"
                  className="cursor-pointer text-sm font-semibold text-white drop-shadow-sm"
                >
                  Auto-Preview Grid Layout
                </label>
                <p className="text-xs leading-relaxed text-white/70">
                  When uploading screenshots, automatically open the layout
                  modal to preview and fine-tune detected grid boxes before
                  scanning.
                </p>
              </div>
            </div>

            <button
              id="toggle-auto-preview"
              type="button"
              role="switch"
              aria-checked={settings.autoPreviewLayout}
              onClick={() =>
                updateSetting("autoPreviewLayout", !settings.autoPreviewLayout)
              }
              className={`relative mt-1 inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.autoPreviewLayout
                  ? "bg-primary shadow-[0_0_12px_rgba(var(--md-sys-color-primary),0.6)]"
                  : "bg-white/20"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.autoPreviewLayout ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Option 2: Auto Review Results */}
          <div className="group flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-all hover:border-white/20 hover:bg-white/[0.07]">
            <div className="flex gap-3.5">
              <div className="mt-0.5 rounded-lg border border-white/10 bg-white/10 p-2 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="toggle-auto-review"
                  className="cursor-pointer text-sm font-semibold text-white drop-shadow-sm"
                >
                  Auto-Review Scan Results
                </label>
                <p className="text-xs leading-relaxed text-white/70">
                  After scanning finishes, automatically open the review modal
                  to verify each detected item against screenshot crops and
                  adjust quantities.
                </p>
              </div>
            </div>

            <button
              id="toggle-auto-review"
              type="button"
              role="switch"
              aria-checked={settings.autoReviewResults}
              onClick={() =>
                updateSetting("autoReviewResults", !settings.autoReviewResults)
              }
              className={`relative mt-1 inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.autoReviewResults
                  ? "bg-primary shadow-[0_0_12px_rgba(var(--md-sys-color-primary),0.6)]"
                  : "bg-white/20"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.autoReviewResults ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <span className="text-xs text-white/40">
            Settings saved in browser storage
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

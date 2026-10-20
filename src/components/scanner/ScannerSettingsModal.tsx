"use client";

import { createPortal } from "react-dom";
import React from "react";
import { ServerEnvProviderInfo, useScannerSettings } from "@/lib/scanner/settings";
import { useModalMotion, usePauseBackground } from "@/lib/hooks";
import { ScannerSettingsContent } from "./ScannerSettingsContent";

export interface ScannerSettingsModalProps {
  onClose: () => void;
  serverEnv?: Record<string, ServerEnvProviderInfo>;
}

/**
 * AI Vision settings modal for desktop environments.
 * Uses the shared ScannerSettingsContent component inside a glassmorphic portal dialog.
 */
export function ScannerSettingsModal({
  onClose,
  serverEnv,
}: ScannerSettingsModalProps) {
  const { mounted } = useScannerSettings();
  usePauseBackground();
  const { dialogRef, backdropRef, close } = useModalMotion(onClose, mounted);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="fixed inset-0 bg-black/55 backdrop-blur-sm transition-opacity duration-300"
        onClick={close}
      />

      {/* Modal Dialog */}
      <div
        ref={dialogRef}
        className="glass-card glass-card--lg glass-card--raised relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden text-white"
      >
        <ScannerSettingsContent
          onClose={close}
          serverEnv={serverEnv}
          isPage={false}
        />
      </div>
    </div>,
    document.body,
  );
}

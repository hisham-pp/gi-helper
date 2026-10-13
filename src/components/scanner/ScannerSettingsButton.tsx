"use client";

import React, { useState } from "react";
import { Settings } from "lucide-react";
import { LazyScannerSettingsModal, preloadScannerSettingsModal } from "./lazy-modals";

export function ScannerSettingsButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        onPointerEnter={preloadScannerSettingsModal}
        onFocus={preloadScannerSettingsModal}
        // Same recessed glass as the top bar's page pill (glass-track)
        className="glass-track flex h-9 w-9 items-center justify-center text-white/55 transition-[color,transform] duration-200 hover:text-white/85 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
        aria-label="Scanner Settings"
        title="Scanner Settings"
      >
        <Settings className="h-4 w-4" />
      </button>

      {isOpen && <LazyScannerSettingsModal onClose={() => setIsOpen(false)} />}
    </>
  );
}

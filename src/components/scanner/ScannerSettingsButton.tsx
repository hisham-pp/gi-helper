"use client";

import React, { useState } from "react";
import { Settings } from "lucide-react";
import { ScannerSettingsModal } from "./ScannerSettingsModal";

export function ScannerSettingsButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-on-surface-variant hover:text-on-surface rounded-full bg-surface-variant/50 p-2 transition-colors hover:bg-surface-variant"
        aria-label="Scanner Settings"
        title="Scanner Settings"
      >
        <Settings className="h-5 w-5" />
      </button>

      <ScannerSettingsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

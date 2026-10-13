"use client";

import React from "react";

interface ScanUploadIconProps {
  className?: string;
}

/**
 * Custom holographic Scan & Upload icon matching the reference screenshot:
 * Four corner reticle brackets enclosing an upward upload arrow with a base bar.
 */
export function ScanUploadIcon({
  className = "w-8 h-8 text-cyan-300",
}: ScanUploadIconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Top-Left Bracket */}
      <path d="M 6 12 V 8 A 2 2 0 0 1 8 6 H 12" />
      {/* Top-Right Bracket */}
      <path d="M 20 6 H 24 A 2 2 0 0 1 26 8 V 12" />
      {/* Bottom-Left Bracket */}
      <path d="M 6 20 V 24 A 2 2 0 0 0 8 26 H 12" />
      {/* Bottom-Right Bracket */}
      <path d="M 20 26 H 24 A 2 2 0 0 0 26 24 V 20" />

      {/* Upload Arrow */}
      <path d="M 16 11.5 V 19" />
      <path d="M 12.5 14.5 L 16 11 L 19.5 14.5" />
      {/* Base Bar */}
      <path d="M 12 21.5 H 20" />
    </svg>
  );
}

"use client";

import React from "react";
import { Scan } from "lucide-react";
import { UploadZone } from "./UploadZone";
import { toast } from "sonner";

interface ClassicScannerViewProps {
  id?: string;
  ariaLabelledBy?: string;
}

/**
 * Classic / Client-Side CV Scanner View
 * Reuses the same UploadZone component with a Scan icon and teal accent,
 * matching the AI Vision scanner layout and ensuring full-screen fit without scrolling.
 */
export function ClassicScannerView({
  id = "scanner-panel",
  ariaLabelledBy = "scanner-tab",
}: ClassicScannerViewProps) {
  const handleFiles = (files: FileList | File[]) => {
    toast.info(
      "Classic Scanner engine is currently under active development. Switch to the AI Vision tab to scan right now!",
      { duration: 5000 },
    );
  };

  return (
    <div
      id={id}
      role="tabpanel"
      aria-labelledby={ariaLabelledBy}
      tabIndex={0}
      className="pill-tab-panel w-full focus-visible:outline-none"
    >
      <UploadZone
        isScanning={false}
        progress={0}
        onFilesSelected={handleFiles}
        inputId="classic-screenshot-upload"
        icon={
          <Scan className="h-7 w-7 sm:h-8 sm:w-8 text-teal-300 drop-shadow-md" />
        }
        title="Click to upload or drag & drop"
        description="Select multiple inventory screenshots to process with the local scanner engine."
        sampleButtonText="Try Sample Screenshot"
        accent="teal"
      />
    </div>
  );
}

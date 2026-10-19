"use client";

import React, { useEffect, useRef, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { useOnlineStatus } from "@/lib/hooks/use-online-status";

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const [showRestored, setShowRestored] = useState(false);
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    if (!isOnline) {
      wasOfflineRef.current = true;
    } else if (wasOfflineRef.current) {
      wasOfflineRef.current = false;
      setShowRestored(true);
      const timer = setTimeout(() => setShowRestored(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (isOnline && !showRestored) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transition-all duration-300 ease-out"
    >
      <div
        className={`glass-card flex items-center gap-2.5 rounded-full px-4 py-2 text-xs font-medium shadow-2xl backdrop-blur-md ${
          !isOnline
            ? "border-amber-500/30 bg-amber-950/40 text-amber-200 shadow-amber-950/50"
            : "border-emerald-500/30 bg-emerald-950/40 text-emerald-200 shadow-emerald-950/50"
        }`}
      >
        {!isOnline ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
            </span>
            <WifiOff className="h-3.5 w-3.5 text-amber-400" />
            <span>Offline Mode • On-device scanner is fully functional</span>
          </>
        ) : (
          <>
            <Wifi className="h-3.5 w-3.5 text-emerald-400" />
            <span>Connection restored • Back online</span>
          </>
        )}
      </div>
    </div>
  );
}

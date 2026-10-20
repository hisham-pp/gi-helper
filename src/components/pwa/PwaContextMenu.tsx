"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  House,
  Backpack,
  Library,
  Settings,
  Sun,
  Moon,
  RefreshCw,
  Copy,
  MessageSquareHeart,
  ScrollText,
  X,
  Compass,
} from "lucide-react";
import { isPwa, triggerHaptic } from "@/lib/haptics";
import { toast } from "sonner";
import { LazyScannerSettingsModal, preloadScannerSettingsModal } from "@/components/scanner/lazy-modals";

interface DesktopPosition {
  x: number;
  y: number;
}

export function PwaContextMenu() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isPwaActive, setIsPwaActive] = useState(false);
  const [desktopPos, setDesktopPos] = useState<DesktopPosition | null>(null);
  const [mobileHoldOpen, setMobileHoldOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const pwa = isPwa();
    setIsPwaActive(pwa);
    if (pwa) {
      document.documentElement.setAttribute("data-pwa", "true");
    }
  }, []);

  const closeMenus = useCallback(() => {
    setDesktopPos(null);
    setMobileHoldOpen(false);
  }, []);

  // Handle Desktop Right-Click
  useEffect(() => {
    if (!mounted) return;

    const handleContextMenu = (e: MouseEvent) => {
      // Allow developer bypass via Shift + Right-Click
      if (e.shiftKey) return;

      // In standalone PWA mode or desktop apps, replace native context menu
      if (!isPwaActive && !window.matchMedia("(display-mode: standalone)").matches) {
        // Also enable if running in desktop app or if user explicitly requested custom context
        const isDesktopWrapper = Boolean(
          (window as unknown as { electron?: unknown; __TAURI__?: unknown }).electron ||
            (window as unknown as { __TAURI__?: unknown }).__TAURI__,
        );
        if (!isDesktopWrapper) return;
      }

      e.preventDefault();

      // Clamp position within viewport
      const menuWidth = 240;
      const menuHeight = 360;
      const x = Math.min(e.clientX, window.innerWidth - menuWidth - 12);
      const y = Math.min(e.clientY, window.innerHeight - menuHeight - 12);

      setDesktopPos({ x: Math.max(12, x), y: Math.max(12, y) });
      setMobileHoldOpen(false);
      triggerHaptic("light");
    };

    window.addEventListener("contextmenu", handleContextMenu);
    return () => window.removeEventListener("contextmenu", handleContextMenu);
  }, [mounted, isPwaActive]);

  // Handle Mobile Touch Hold (Long-Press)
  useEffect(() => {
    if (!mounted) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
        return;
      }

      const touch = e.touches[0];
      touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };

      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);

      // Only trigger on PWA mode or touch devices
      if (!isPwaActive && !window.matchMedia("(display-mode: standalone)").matches) {
        return;
      }

      touchTimerRef.current = setTimeout(() => {
        // Don't trigger if user is interacting with interactive input elements
        const target = e.target as HTMLElement | null;
        if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
          return;
        }

        triggerHaptic("medium");
        setMobileHoldOpen(true);
        setDesktopPos(null);
      }, 480);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartPosRef.current || !touchTimerRef.current) return;
      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - touchStartPosRef.current.x);
      const dy = Math.abs(touch.clientY - touchStartPosRef.current.y);
      // Cancel hold if finger drags
      if (dx > 12 || dy > 12) {
        clearTimeout(touchTimerRef.current);
        touchTimerRef.current = null;
      }
    };

    const handleTouchEnd = () => {
      if (touchTimerRef.current) {
        clearTimeout(touchTimerRef.current);
        touchTimerRef.current = null;
      }
      touchStartPosRef.current = null;
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    };
  }, [mounted, isPwaActive]);

  // Close menus on outside click or escape
  useEffect(() => {
    if (!desktopPos && !mobileHoldOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenus();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenus();
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [desktopPos, mobileHoldOpen, closeMenus]);

  if (!mounted) return null;

  const navigateTo = (path: string) => {
    triggerHaptic("selection");
    closeMenus();
    router.push(path as unknown as Parameters<typeof router.push>[0]);
  };

  const handleCopyLink = () => {
    triggerHaptic("light");
    closeMenus();
    navigator.clipboard.writeText(window.location.href);
    toast.success("Page link copied to clipboard");
  };

  const handleReload = () => {
    triggerHaptic("selection");
    closeMenus();
    window.location.reload();
  };

  const handleToggleTheme = () => {
    triggerHaptic("selection");
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const handleOpenSettings = () => {
    triggerHaptic("selection");
    closeMenus();
    preloadScannerSettingsModal();
    setSettingsOpen(true);
  };

  return (
    <>
      {/* Desktop Custom Context Menu */}
      {desktopPos && (
        <div
          ref={menuRef}
          style={{ left: desktopPos.x, top: desktopPos.y }}
          className="glass-card glass-card--raised fixed z-50 flex w-56 flex-col gap-1 rounded-2xl border border-white/10 bg-neutral-900/95 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 select-none text-white text-xs font-medium"
        >
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 text-white/50 text-[11px] font-semibold tracking-wider uppercase">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <Compass className="h-3.5 w-3.5" />
              GI Helper Quick Actions
            </span>
            <button
              onClick={closeMenus}
              className="text-white/40 hover:text-white transition-colors"
              aria-label="Close menu"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-0.5 py-1">
            <button
              onClick={() => navigateTo("/")}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-white/80 hover:bg-cyan-500/15 hover:text-cyan-200 transition-colors"
            >
              <House className="h-4 w-4 text-cyan-400" />
              <span>Home / Scanner</span>
            </button>

            <button
              onClick={() => navigateTo("/inventory/materials")}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-white/80 hover:bg-cyan-500/15 hover:text-cyan-200 transition-colors"
            >
              <Backpack className="h-4 w-4 text-cyan-400" />
              <span>Inventory</span>
            </button>

            <button
              onClick={() => navigateTo("/db/materials")}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-white/80 hover:bg-cyan-500/15 hover:text-cyan-200 transition-colors"
            >
              <Library className="h-4 w-4 text-cyan-400" />
              <span>Database</span>
            </button>
          </div>

          <div className="border-t border-white/10 pt-1 flex flex-col gap-0.5">
            <button
              onClick={handleOpenSettings}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-white/80 hover:bg-cyan-500/15 hover:text-cyan-200 transition-colors"
            >
              <Settings className="h-4 w-4 text-amber-400" />
              <span>Scanner Settings</span>
            </button>

            <button
              onClick={handleToggleTheme}
              className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-white/80 hover:bg-cyan-500/15 hover:text-cyan-200 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                {resolvedTheme === "dark" ? (
                  <Sun className="h-4 w-4 text-amber-300" />
                ) : (
                  <Moon className="h-4 w-4 text-cyan-300" />
                )}
                <span>Theme: {resolvedTheme === "dark" ? "Dark" : "Light"}</span>
              </span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-white/80 hover:bg-cyan-500/15 hover:text-cyan-200 transition-colors"
            >
              <Copy className="h-4 w-4 text-teal-400" />
              <span>Copy Page Link</span>
            </button>

            <button
              onClick={handleReload}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-white/80 hover:bg-cyan-500/15 hover:text-cyan-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4 text-emerald-400" />
              <span>Reload App</span>
            </button>
          </div>

          <div className="border-t border-white/10 pt-1 flex flex-col gap-0.5">
            <button
              onClick={() => navigateTo("/feedback")}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-1 text-left text-[11px] text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            >
              <MessageSquareHeart className="h-3.5 w-3.5 text-rose-400" />
              <span>Feedback</span>
            </button>

            <button
              onClick={() => navigateTo("/versions")}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-1 text-left text-[11px] text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            >
              <ScrollText className="h-3.5 w-3.5 text-indigo-400" />
              <span>Release Notes</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Custom Hold Action Sheet */}
      {mobileHoldOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closeMenus}
        >
          <div
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
            className="glass-card glass-card--raised w-full max-w-lg mx-auto rounded-t-3xl border-t border-white/15 bg-neutral-900/98 p-5 pb-[max(1.5rem,env(safe-area-inset-bottom,1.5rem))] shadow-2xl animate-in slide-in-from-bottom duration-250 select-none"
          >
            {/* Sheet Handle */}
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-white/25" />

            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-cyan-400" />
                <span className="text-sm font-bold text-white tracking-wide">GI Helper Quick Menu</span>
              </div>
              <button
                onClick={closeMenus}
                className="rounded-full bg-white/10 p-1.5 text-white/60 active:scale-95 hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Action Grid */}
            <div className="grid grid-cols-4 gap-2.5 py-4">
              <button
                onClick={() => navigateTo("/")}
                className="glass-track flex flex-col items-center justify-center gap-1.5 rounded-2xl p-3 text-center text-white/80 active:scale-95 transition-transform"
              >
                <House className="h-5 w-5 text-cyan-300" />
                <span className="text-[11px] font-semibold">Home</span>
              </button>

              <button
                onClick={() => navigateTo("/inventory/materials")}
                className="glass-track flex flex-col items-center justify-center gap-1.5 rounded-2xl p-3 text-center text-white/80 active:scale-95 transition-transform"
              >
                <Backpack className="h-5 w-5 text-cyan-300" />
                <span className="text-[11px] font-semibold">Inventory</span>
              </button>

              <button
                onClick={() => navigateTo("/db/materials")}
                className="glass-track flex flex-col items-center justify-center gap-1.5 rounded-2xl p-3 text-center text-white/80 active:scale-95 transition-transform"
              >
                <Library className="h-5 w-5 text-cyan-300" />
                <span className="text-[11px] font-semibold">Database</span>
              </button>

              <button
                onClick={handleOpenSettings}
                className="glass-track flex flex-col items-center justify-center gap-1.5 rounded-2xl p-3 text-center text-white/80 active:scale-95 transition-transform"
              >
                <Settings className="h-5 w-5 text-amber-400" />
                <span className="text-[11px] font-semibold">Settings</span>
              </button>
            </div>

            {/* List Actions */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleToggleTheme}
                  className="glass-track flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-semibold text-white/80 active:scale-95 transition-transform"
                >
                  {resolvedTheme === "dark" ? (
                    <Sun className="h-4 w-4 text-amber-300" />
                  ) : (
                    <Moon className="h-4 w-4 text-cyan-300" />
                  )}
                  <span>{resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="glass-track flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-semibold text-white/80 active:scale-95 transition-transform"
                >
                  <Copy className="h-4 w-4 text-teal-300" />
                  <span>Copy Link</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => navigateTo("/feedback")}
                  className="glass-track flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-semibold text-white/70 active:scale-95 transition-transform"
                >
                  <MessageSquareHeart className="h-4 w-4 text-rose-400" />
                  <span>Feedback</span>
                </button>

                <button
                  onClick={handleReload}
                  className="glass-track flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-semibold text-white/70 active:scale-95 transition-transform"
                >
                  <RefreshCw className="h-4 w-4 text-emerald-400" />
                  <span>Reload</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal instance if opened via custom context menu */}
      {settingsOpen && <LazyScannerSettingsModal onClose={() => setSettingsOpen(false)} />}
    </>
  );
}

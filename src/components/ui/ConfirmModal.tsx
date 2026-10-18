"use client";

import { createPortal } from "react-dom";
import React, { useEffect, useId } from "react";
import { CircleHelp, TriangleAlert, type LucideIcon } from "lucide-react";
import { useModalMotion, usePauseBackground } from "@/lib/hooks";

export interface ConfirmOptions {
  title: string;
  message: string;
  /** Label of the confirm button, e.g. "Delete". */
  confirmLabel: string;
  cancelLabel?: string;
  /** "danger" for destructive actions: rose accent and button. */
  tone?: "danger" | "default";
  icon?: LucideIcon;
}

interface ConfirmModalProps extends ConfirmOptions {
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Glass confirmation dialog, in place of the browser's confirm(). Use it
 * through useConfirm(), which loads it on demand and mounts it only while open.
 * Cancel has the focus, so Enter never confirms a destructive action by accident.
 */
export function ConfirmModal({
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  tone = "default",
  icon,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  usePauseBackground();
  const { dialogRef, backdropRef, close, closeThen } = useModalMotion(onClose);
  const id = useId();
  const danger = tone === "danger";
  const Icon = icon ?? (danger ? TriangleAlert : CircleHelp);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [close]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        ref={backdropRef}
        className="fixed inset-0 bg-black/55 backdrop-blur-sm"
        onClick={close}
      />

      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-message`}
        style={danger ? ({ "--glass-accent": "251, 113, 133" } as React.CSSProperties) : undefined}
        className="glass-card glass-card--lg glass-card--raised relative z-10 w-full max-w-sm p-6 text-white"
      >
        <div className="flex items-start gap-3.5">
          <span
            className={`glass-chip h-10 w-10 shrink-0 justify-center rounded-xl ${danger ? "text-rose-300" : "text-cyan-300"}`}
          >
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0 space-y-1.5 pt-0.5">
            <h2 id={`${id}-title`} className="text-base font-bold tracking-tight text-white">
              {title}
            </h2>
            <p id={`${id}-message`} className="text-sm leading-relaxed text-white/70">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" autoFocus onClick={close} className="glass-btn px-4 py-2 text-sm">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => closeThen(onConfirm)}
            className={`glass-btn px-4 py-2 text-sm font-bold ${danger ? "glass-btn--danger" : "glass-btn--primary"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

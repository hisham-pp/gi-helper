"use client";

import React, { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import type { ConfirmOptions } from "./ConfirmModal";

// Loaded on demand and mounted only while open, like the other modals
const LazyConfirmModal = dynamic(() => import("./ConfirmModal").then((m) => m.ConfirmModal), {
  ssr: false,
});

interface PendingConfirm extends ConfirmOptions {
  resolve: (confirmed: boolean) => void;
}

/**
 * A glass replacement for the browser's confirm():
 *
 *   const { confirm, confirmModal } = useConfirm();
 *   if (!(await confirm({ title, message, confirmLabel: "Delete", tone: "danger" }))) return;
 *   ...
 *   return <>{...}{confirmModal}</>;
 *
 * The promise settles once the dialog's exit animation has played.
 */
export function useConfirm() {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => setPending({ ...options, resolve })),
    [],
  );

  const settle = (confirmed: boolean) => {
    pending?.resolve(confirmed);
    setPending(null);
  };

  const confirmModal = pending ? (
    <LazyConfirmModal
      title={pending.title}
      message={pending.message}
      confirmLabel={pending.confirmLabel}
      cancelLabel={pending.cancelLabel}
      tone={pending.tone}
      icon={pending.icon}
      onConfirm={() => settle(true)}
      onClose={() => settle(false)}
    />
  ) : null;

  return { confirm, confirmModal };
}

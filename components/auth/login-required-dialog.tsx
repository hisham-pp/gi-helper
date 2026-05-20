"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function LoginRequiredDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-scrim/55 p-4"
      role="dialog"
    >
      <Card
        variant="outlined"
        className="w-full max-w-md rounded-lg bg-surface p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-on-surface-variant text-sm font-bold">
              Login required
            </p>
            <h2 className="text-on-surface mt-1 text-xl font-bold">
              Save your tracker data
            </h2>
          </div>
          <button
            aria-label="Close login prompt"
            className="grid h-9 w-9 place-items-center rounded-lg border border-outline-variant text-on-surface transition hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            type="button"
            onClick={onClose}
          >
            x
          </button>
        </div>
        <p className="text-on-surface-variant mt-4 text-sm leading-6">
          You can browse the app without an account. Login or register when you
          want to save inventory, goals, cooking progress, or map completion.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link className="w-full" href="/login">
            <Button className="w-full rounded-lg" type="button">
              Login
            </Button>
          </Link>
          <Link className="w-full" href="/register">
            <Button className="w-full rounded-lg" type="button" variant="outlined">
              Create account
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

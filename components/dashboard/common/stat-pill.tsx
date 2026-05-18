"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatPill({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "danger";
}) {
  const tones = {
    default: "bg-surface-variant text-on-surface-variant",
    success: "bg-primary-container text-on-primary-container",
    danger: "bg-error-container text-on-error-container",
  } as const;

  return (
    <Card variant="filled" className={cn("p-4", tones[tone])}>
      <p className="text-xs font-bold uppercase tracking-wider opacity-80">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </Card>
  );
}

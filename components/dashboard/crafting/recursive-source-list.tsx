"use client";

import { formatNumber } from "@/lib/utils";

export function RecursiveSourceList({
  sources,
}: {
  sources: Array<{
    materialId: string;
    materialName: string;
    quantity: number;
  }>;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-on-surface-variant text-sm font-bold uppercase tracking-wider">
        Recursive sources
      </h3>
      <div className="grid gap-2">
        {sources.length === 0 ? (
          <p className="text-on-surface-variant text-sm italic">
            No lower-tier materials needed.
          </p>
        ) : (
          sources.map((source) => (
            <div
              key={source.materialId}
              className="flex items-center justify-between rounded-xl border border-outline-variant px-4 py-3 text-sm"
            >
              <span className="font-medium">{source.materialName}</span>
              <span className="font-bold text-primary">
                {formatNumber(source.quantity)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { MaterialItem } from "@/lib/types";
import { getRarityStyles, getMaterialCategoryLabel } from "@/lib/materials";
import { Copy, Check, Eye } from "lucide-react";
import { toast } from "sonner";

interface MaterialTableViewProps {
  materials: MaterialItem[];
  onSelectMaterial: (material: MaterialItem) => void;
}

export function MaterialTableView({
  materials,
  onSelectMaterial,
}: MaterialTableViewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success(`Copied ID: "${id}"`);
    setTimeout(() => setCopiedId(null), 1800);
  };

  if (materials.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20 shadow-xl backdrop-blur-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-white/90">
          <thead className="border-b border-white/10 bg-white/5 text-xs font-semibold uppercase tracking-wider text-white/60">
            <tr>
              <th scope="col" className="w-16 px-4 py-3.5 text-center">
                Order
              </th>
              <th scope="col" className="w-16 px-4 py-3.5 text-center">
                Icon
              </th>
              <th scope="col" className="px-4 py-3.5">
                Name
              </th>
              <th scope="col" className="w-24 px-4 py-3.5 text-center">
                Rarity
              </th>
              <th scope="col" className="px-4 py-3.5">
                Category
              </th>
              <th
                scope="col"
                className="w-24 px-4 py-3.5 text-center font-mono"
              >
                SortRank
              </th>
              <th scope="col" className="px-4 py-3.5 font-mono">
                Item ID
              </th>
              <th scope="col" className="w-24 px-4 py-3.5 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {materials.map((mat) => {
              const rarity = mat.rarity || 1;
              const styles = getRarityStyles(rarity);
              const categoryLabel = getMaterialCategoryLabel(mat);
              const isCopied = copiedId === mat.id;

              return (
                <tr
                  key={mat.id}
                  onClick={() => onSelectMaterial(mat)}
                  className="group cursor-pointer transition-colors hover:bg-white/10"
                >
                  {/* Order */}
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block rounded-md border border-white/10 bg-black/40 px-2 py-0.5 font-mono text-xs font-bold text-white shadow-sm">
                      #{mat.order}
                    </span>
                  </td>

                  {/* Icon */}
                  <td className="px-4 py-3 text-center">
                    <div className="relative mx-auto flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-black/40 shadow-inner transition-transform group-hover:scale-105">
                      <img
                        src={mat.image}
                        alt={mat.name}
                        className="h-8 w-8 object-contain"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  </td>

                  {/* Name */}
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white transition-colors group-hover:text-primary">
                      {mat.name}
                    </div>
                  </td>

                  {/* Rarity */}
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block rounded-md border px-2 py-0.5 text-xs font-medium ${styles.badgeBg}`}
                    >
                      {rarity}★
                    </span>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3 text-xs text-white/70">
                    <span className="inline-block rounded border border-white/5 bg-white/5 px-2 py-1">
                      {categoryLabel}
                    </span>
                  </td>

                  {/* SortRank */}
                  <td className="px-4 py-3 text-center font-mono text-xs text-white/50">
                    {mat.sortRank ?? "—"}
                  </td>

                  {/* ID */}
                  <td className="px-4 py-3 font-mono text-xs text-primary/90">
                    <code className="rounded border border-white/5 bg-black/30 px-1.5 py-0.5">
                      {mat.id}
                    </code>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => handleCopyId(e, mat.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/15 hover:text-white"
                        title="Copy Material ID"
                        aria-label="Copy ID"
                      >
                        {isCopied ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectMaterial(mat);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/15 hover:text-white"
                        title="View Details"
                        aria-label="View Details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

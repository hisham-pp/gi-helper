"use client";

import React, { useState } from "react";
import { MaterialItem } from "@/lib/types";
import { getRarityStyles, getMaterialCategoryLabel } from "@/lib/materials";
import { Copy, Check, Eye } from "lucide-react";
import { toast } from "sonner";
import { MaterialThumb } from "@/components/ui/MaterialThumb";

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
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-white/90">
          <thead className="border-b border-white/10 bg-white/[0.04] text-xs font-semibold uppercase tracking-wider text-white/55">
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
          <tbody className="divide-y divide-white/[0.06]">
            {materials.map((mat) => {
              const rarity = mat.rarity || 1;
              const styles = getRarityStyles(rarity);
              const categoryLabel = getMaterialCategoryLabel(mat);
              const isCopied = copiedId === mat.id;

              return (
                <tr
                  key={mat.id}
                  onClick={() => onSelectMaterial(mat)}
                  // Rarity colour tints this row's glass icon well and rarity chip
                  style={{ "--glass-accent": styles.accent } as React.CSSProperties}
                  className="group cursor-pointer transition-colors hover:bg-white/[0.06]"
                >
                  {/* Order */}
                  <td className="px-4 py-3 text-center">
                    <span className="glass-chip px-2.5 py-0.5 font-mono text-xs font-bold text-white">
                      #{mat.order}
                    </span>
                  </td>

                  {/* Icon */}
                  <td className="px-4 py-3 text-center">
                    <div className="glass-well glass-well--tinted relative mx-auto flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl transition-transform group-hover:scale-105">
                      <MaterialThumb id={mat.id} alt={mat.name} size={32} className="h-8 w-8" />
                    </div>
                  </td>

                  {/* Name */}
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white transition-colors group-hover:text-cyan-100">
                      {mat.name}
                    </div>
                  </td>

                  {/* Rarity */}
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`glass-chip px-2.5 py-0.5 text-xs font-semibold ${styles.starColor}`}
                    >
                      {rarity}★
                    </span>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3 text-xs text-white/70">
                    <span className="glass-chip px-2.5 py-1">
                      {categoryLabel}
                    </span>
                  </td>

                  {/* SortRank */}
                  <td className="px-4 py-3 text-center font-mono text-xs text-white/50">
                    {mat.sortRank ?? "—"}
                  </td>

                  {/* ID */}
                  <td className="px-4 py-3 font-mono text-xs text-cyan-300/90">
                    <code className="glass-well rounded-md px-2 py-0.5">
                      {mat.id}
                    </code>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => handleCopyId(e, mat.id)}
                        className="glass-icon-btn h-7 w-7 rounded-lg"
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
                        className="glass-icon-btn h-7 w-7 rounded-lg"
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

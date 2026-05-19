"use client";

import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { localImageSrc } from "@/lib/image-src";
import type React from "react";

export default function IconGrid({
  items,
}: {
  items: Array<{ id: string; name: string; image: string; iconName: string }>;
}) {
  const handleCopy = async (iconName: string) => {
    try {
      await navigator.clipboard.writeText(iconName);
      toast.success(`Copied ${iconName}`);
    } catch (err) {
      toast.error("Copy failed");
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-6 md:grid-cols-8">
      {items.map((it) => (
        <div key={it.id} className="flex flex-col items-center gap-2 p-2">
          <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-surface-variant">
            <Image
              src={localImageSrc(it.image)}
              alt={it.name}
              fill
              className="object-contain p-2"
              sizes="56px"
            />
          </div>
          <div className="text-center text-xs">
            <div className="w-28 truncate">{it.iconName}</div>
            <Button
              variant="text"
              onClick={() => handleCopy(it.iconName)}
              className="mt-1"
            >
              Copy
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";

import Image from "next/image";
import { Sparkles } from "lucide-react";

import { EmptyState } from "@/components/dashboard/common/empty-state";
import { Panel } from "@/components/dashboard/common/panel";
import { Card } from "@/components/ui/card";

export function SummaryList({
  title,
  description,
  items,
  emptyText,
}: {
  title: string;
  description: string;
  items: Array<{ id: string; title: string; subtitle: string; image: string }>;
  emptyText: string;
}) {
  return (
    <Panel title={title} description={description}>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="h-6 w-6" />}
            title={title}
            description={emptyText}
          />
        ) : (
          <ul className="space-y-3" aria-label={title}>
            {items.map((item) => (
              <li key={item.id}>
                <Card
                  variant="outlined"
                  className="flex items-center gap-4 p-3 transition-colors hover:bg-surface-variant/20"
                >
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-surface-variant">
                    <Image
                      src={`/api/material-image/${item.image}`}
                      alt=""
                      fill
                      className="object-contain p-2"
                      sizes="48px"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-on-surface truncate font-bold">
                      {item.title}
                    </p>
                    <p className="text-on-surface-variant text-xs font-medium">
                      {item.subtitle}
                    </p>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Panel>
  );
}

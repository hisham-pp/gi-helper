"use client";

import type { PropsWithChildren, ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { sectionId } from "@/components/dashboard/common/section-id";

export function Panel({
  title,
  description,
  children,
  action,
}: PropsWithChildren<{
  title: string;
  description: string;
  action?: ReactNode;
}>) {
  return (
    <section aria-labelledby={sectionId(title)}>
      <Card className="flex flex-col p-6" variant="outlined">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2
              id={sectionId(title)}
              className="text-on-surface text-xl font-bold"
            >
              {title}
            </h2>
            <p className="text-on-surface-variant text-sm">{description}</p>
          </div>
          {action}
        </div>
        {children}
      </Card>
    </section>
  );
}

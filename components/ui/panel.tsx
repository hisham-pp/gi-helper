import type { PropsWithChildren, ReactNode } from "react";
import { Card } from "@/components/ui/card";

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
    <Card className="flex flex-col p-6" variant="outlined">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-on-surface text-xl font-bold">{title}</h2>
          <p className="text-on-surface-variant text-sm">{description}</p>
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}

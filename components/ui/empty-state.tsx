import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="text-on-primary-container mb-4 rounded-full bg-primary-container p-4 shadow-sm">
        {icon}
      </div>
      <h3 className="text-on-surface font-bold">{title}</h3>
      <p className="text-on-surface-variant mt-2 max-w-sm text-sm">
        {description}
      </p>
    </div>
  );
}

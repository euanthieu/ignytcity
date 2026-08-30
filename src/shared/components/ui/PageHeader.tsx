import React, { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b text-left"
      style={{ borderColor: "var(--border-default)" }}
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          {title}
        </h1>
        {description && (
          <p
            className="text-xs font-medium mt-1"
            style={{ color: "var(--text-secondary)" }}
          >
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="flex items-center gap-3 w-full sm:w-auto">{action}</div>
      )}
    </div>
  );
}

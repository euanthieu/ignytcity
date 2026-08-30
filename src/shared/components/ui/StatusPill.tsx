import React from "react";

type PillVariant = "success" | "warning" | "error" | "info";

interface StatusPillProps {
  label: string;
  variant?: PillVariant;
}

export function StatusPill({ label, variant = "info" }: StatusPillProps) {
  const schemes = {
    success: {
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      text: "text-emerald-600 dark:text-emerald-400",
    },
    warning: {
      bg: "bg-amber-50 dark:bg-amber-950/30",
      text: "text-amber-600 dark:text-amber-400",
    },
    error: {
      bg: "bg-rose-50 dark:bg-rose-950/30",
      text: "text-rose-600 dark:text-rose-400",
    },
    info: {
      bg: "bg-zinc-100 dark:bg-zinc-800",
      text: "text-zinc-600 dark:text-zinc-400",
    },
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${schemes[variant].bg} ${schemes[variant].text}`}
    >
      {label}
    </span>
  );
}

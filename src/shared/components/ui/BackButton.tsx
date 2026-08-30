import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  onClick: () => void;
  className?: string;
}

export function BackButton({ onClick, className = "" }: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-[var(--text-secondary)] transition-colors hover:bg-[var(--background-tertiary)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-core)] ${className}`}
      aria-label="Go back"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      <span>Back</span>
    </button>
  );
}

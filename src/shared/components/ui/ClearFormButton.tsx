import { Trash2 } from "lucide-react";

interface ClearFormButtonProps {
  onClear: () => void;
  className?: string;
}

export function ClearFormButton({
  onClear,
  className = "",
}: ClearFormButtonProps) {
  const handleClick = () => {
    if (
      window.confirm(
        "Are you sure you want to start over? This will delete everything you just typed.",
      )
    ) {
      onClear();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-500 transition-colors hover:bg-rose-500/10 focus:outline-none focus:ring-2 focus:ring-rose-500/30 ${className}`}
    >
      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
      Clear form
    </button>
  );
}

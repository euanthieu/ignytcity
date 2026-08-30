export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-brand-vibrant/20 rounded-md ${className}`}
    />
  );
}

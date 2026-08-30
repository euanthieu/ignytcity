import React, { HTMLAttributes } from "react";

export function Grid({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

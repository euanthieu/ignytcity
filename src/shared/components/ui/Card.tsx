import React, { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export function Card({
  children,
  className = "",
  hoverable = false,
  ...props
}: CardProps) {
  return (
    <div
      className={`border rounded-2xl p-4 shadow-sm transition-all duration-300 overflow-hidden text-left ${
        hoverable ? "hover:shadow-md hover:scale-[1.01] cursor-pointer" : ""
      } ${className}`}
      style={{
        backgroundColor: "var(--background-elevated)",
        borderColor: "var(--border-light)",
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`mb-3 flex items-center justify-between gap-4 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardContent({
  children,
  className = "",
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={`space-y-2 ${className}`}>{children}</div>;
}

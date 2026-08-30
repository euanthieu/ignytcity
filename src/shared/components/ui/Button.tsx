import React, { ButtonHTMLAttributes } from "react";
import { RefreshCw } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "dark";
  fullWidth?: boolean;
}

export function Button({
  children,
  isLoading,
  variant = "primary",
  fullWidth = false,
  className = "",
  disabled,
  style,
  ...props
}: ButtonProps) {
  // Dynamic background assignments utilizing CSS design tokens
  const getVariantStyles = () => {
    switch (variant) {
      case "secondary":
        return {
          backgroundColor: "var(--background-secondary)",
          color: "var(--text-primary)",
        };
      case "dark":
        return { backgroundColor: "var(--brand-dark)", color: "#ffffff" };
      case "primary":
      default:
        return { backgroundColor: "var(--brand-core)", color: "#ffffff" };
    }
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`
        flex items-center justify-center gap-2 transition-all shadow-md 
        active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none 
        text-xs font-bold rounded-xl h-10 px-4
        ${fullWidth ? "w-full" : "w-auto"} 
        ${className}
      `}
      style={{ ...getVariantStyles(), ...style }}
      {...props}
    >
      {isLoading ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin" /> Processing...
        </>
      ) : (
        children
      )}
    </button>
  );
}

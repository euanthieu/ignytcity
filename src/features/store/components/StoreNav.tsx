"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useCartStore } from "../stores/cart.store";

const LINKS = [
  { href: "#vision-mission", label: "Vision & Mission" },
  { href: "#drop", label: "Shop" },
  { href: "#size-guide", label: "Size Guide" },
  { href: "#how-to-order", label: "How to Order" },
];

export function StoreNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const lines = useCartStore((s) => s.lines);
  const openCart = useCartStore((s) => s.open);
  const count = lines.reduce((sum, l) => sum + l.qty, 0);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const solid = scrolled || isDark;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        solid
          ? "bg-[#ffffff] dark:bg-[#14100d] border-b border-[#151515]/10 dark:border-[#f5f2ee]/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 h-[64px] flex items-center justify-between">
        <a
          href="#top"
          className={`ic-display text-[18px] tracking-[2px] ${
            solid ? "text-[#151515] dark:text-[#f5f2ee]" : "text-[#ffffff]"
          }`}
        >
          IGNYT CITY
        </a>

        <nav
          className={`hidden md:flex items-center gap-8 ic-mono text-[11px] ${
            solid ? "text-[#151515] dark:text-[#f5f2ee]" : "text-[#ffffff]"
          }`}
        >
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="hover:opacity-60 transition-opacity"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label="Toggle theme"
            className={`p-2 border transition-colors ${
              solid
                ? "border-[#151515]/30 dark:border-[#f5f2ee]/30 text-[#151515] dark:text-[#f5f2ee]"
                : "border-[#ffffff]/60 text-[#ffffff]"
            }`}
          >
            {isDark ? (
              <Sun className="w-3.5 h-3.5" />
            ) : (
              <Moon className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            onClick={openCart}
            className={`ic-mono text-[11px] flex items-center gap-2 border px-4 py-2 transition-colors ${
              solid
                ? "border-[#151515] dark:border-[#f5f2ee] text-[#151515] dark:text-[#f5f2ee] hover:bg-[#151515] hover:text-[#ffffff] dark:hover:bg-[#f5f2ee] dark:hover:text-[#14100d]"
                : "border-[#ffffff] text-[#ffffff] hover:bg-[#ffffff] hover:text-[#151515]"
            }`}
          >
            Cart ({count})
          </button>
        </div>
      </div>
    </header>
  );
}

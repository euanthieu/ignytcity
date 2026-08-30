"use client";

import { useState } from "react";
import Image from "next/image";
import { Product, ProductSize } from "../types";
import { SIZES } from "../data/products";
import { useCartStore } from "../stores/cart.store";

export function ProductCard({ product }: { product: Product }) {
  const [showFront, setShowFront] = useState(false);
  const [size, setSize] = useState<ProductSize>("L");
  const [justAdded, setJustAdded] = useState(false);
  const addLine = useCartStore((s) => s.addLine);

  const handleAdd = () => {
    addLine(product.id, size);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <div className="group flex flex-col">
      <div
        className="relative aspect-[4/5] w-full overflow-hidden bg-[#ececec] dark:bg-[#1e1a17] cursor-pointer"
        onMouseEnter={() => setShowFront(true)}
        onMouseLeave={() => setShowFront(false)}
        onClick={() => setShowFront((v) => !v)}
      >
        <Image
          src={product.back}
          alt={`${product.name} — back`}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className={`object-cover transition-opacity duration-500 ${showFront ? "opacity-0" : "opacity-100"}`}
        />
        <Image
          src={product.front}
          alt={`${product.name} — front`}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className={`object-cover transition-opacity duration-500 ${showFront ? "opacity-100" : "opacity-0"}`}
        />
        <span className="absolute top-3 left-3 border border-[#0073ff] text-[#0073ff] ic-mono text-[10px] px-2 py-1 bg-[#ffffff] dark:bg-[#14100d]">
          Pre-Order
        </span>
        <span className="absolute bottom-3 right-3 ic-mono text-[10px] text-[#151515]/50 dark:text-[#f5f2ee]/50 bg-[#ffffff]/80 dark:bg-[#14100d]/80 px-2 py-1">
          {showFront ? "Front" : "Back"}
        </span>
      </div>

      <div className="pt-4 flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="ic-mono text-[12px] font-medium text-[#151515] dark:text-[#f5f2ee]">
            {product.name}
          </h3>
          <span className="ic-mono text-[12px] text-[#151515] dark:text-[#f5f2ee]">
            ₱{product.price}
          </span>
        </div>
        <p className="ic-mono text-[10px] normal-case tracking-normal text-[#151515]/60 dark:text-[#f5f2ee]/60">
          {product.colorway} &middot; {product.fit}
        </p>
        <p className="ic-mono text-[10px] normal-case tracking-normal text-[#151515]/50 dark:text-[#f5f2ee]/50 italic mt-1">
          &ldquo;{product.tagline}&rdquo;
        </p>

        <div className="flex items-stretch gap-2 mt-4">
          <select
            value={size}
            onChange={(e) => setSize(e.target.value as ProductSize)}
            aria-label={`Size for ${product.name}`}
            className="ic-mono text-[11px] border border-[#151515] dark:border-[#f5f2ee] bg-[#ffffff] dark:bg-[#14100d] text-[#151515] dark:text-[#f5f2ee] px-3 py-2 focus:outline-none"
          >
            {SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            className="flex-1 ic-mono text-[11px] px-4 py-2 bg-[#24170f] text-[#ffffff] hover:opacity-90 transition-opacity"
          >
            {justAdded ? "Added ✓" : "Add to Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

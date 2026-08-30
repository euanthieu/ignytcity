import { PRODUCTS } from "../data/products";
import { ProductCard } from "./ProductCard";

export function ProductGrid() {
  return (
    <section
      id="drop"
      className="max-w-[1200px] mx-auto px-5 sm:px-8 py-16 sm:py-[64px]"
    >
      <div className="text-center mb-12">
        <p className="ic-mono text-[10px] tracking-[3px] text-[#151515]/60 dark:text-[#f5f2ee]/60 mb-3">
          Ignyt City Merch
        </p>
        <h2 className="ic-display text-[32px] sm:text-[40px] tracking-[3px] sm:tracking-[4px] text-[#151515] dark:text-[#f5f2ee]">
          Pre-Order the Drop
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-12">
        {PRODUCTS.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

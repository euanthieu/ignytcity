"use client";

import Image from "next/image";
import { useCartStore } from "../stores/cart.store";
import { PRODUCTS } from "../data/products";

export function CartDrawer() {
  const { lines, isOpen, close, setQty, removeLine } = useCartStore();

  const items = lines
    .map((line) => {
      const product = PRODUCTS.find((p) => p.id === line.productId);
      return product ? { ...line, product } : null;
    })
    .filter(Boolean) as {
    productId: string;
    size: string;
    qty: number;
    product: (typeof PRODUCTS)[number];
  }[];

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);

  const proceed = () => {
    close();
    document
      .getElementById("how-to-order")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-[#151515]/50 transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={close}
      />
      <aside
        className={`fixed top-0 right-0 z-[70] h-full w-full max-w-[420px] bg-[#ffffff] dark:bg-[#14100d] flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 h-[64px] border-b border-[#151515]/10 dark:border-[#f5f2ee]/10">
          <h2 className="ic-display text-[16px] tracking-[2px] text-[#151515] dark:text-[#f5f2ee]">
            Your Order
          </h2>
          <button
            onClick={close}
            className="ic-mono text-[11px] text-[#151515]/60 dark:text-[#f5f2ee]/60 hover:text-[#151515] dark:hover:text-[#f5f2ee]"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">
          {items.length === 0 && (
            <p className="ic-mono text-[12px] normal-case text-[#151515]/50 dark:text-[#f5f2ee]/50">
              Nothing in your order yet. Add a tee from the drop.
            </p>
          )}

          {items.map((item) => (
            <div key={`${item.productId}-${item.size}`} className="flex gap-4">
              <div className="relative w-[72px] h-[90px] shrink-0 bg-[#ececec] dark:bg-[#1e1a17]">
                <Image
                  src={item.product.front}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-start justify-between">
                  <p className="ic-mono text-[11px] text-[#151515] dark:text-[#f5f2ee]">
                    {item.product.name}
                  </p>
                  <button
                    onClick={() =>
                      removeLine(item.productId, item.size as never)
                    }
                    className="ic-mono text-[10px] text-[#151515]/40 dark:text-[#f5f2ee]/40 hover:text-[#151515] dark:hover:text-[#f5f2ee]"
                  >
                    Remove
                  </button>
                </div>
                <p className="ic-mono text-[10px] text-[#151515]/50 dark:text-[#f5f2ee]/50">
                  Size {item.size} &middot; ₱{item.product.price}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() =>
                      setQty(item.productId, item.size as never, item.qty - 1)
                    }
                    className="w-6 h-6 border border-[#151515]/30 dark:border-[#f5f2ee]/30 text-[#151515] dark:text-[#f5f2ee] ic-mono text-[11px]"
                  >
                    −
                  </button>
                  <span className="ic-mono text-[11px] w-4 text-center text-[#151515] dark:text-[#f5f2ee]">
                    {item.qty}
                  </span>
                  <button
                    onClick={() =>
                      setQty(item.productId, item.size as never, item.qty + 1)
                    }
                    className="w-6 h-6 border border-[#151515]/30 dark:border-[#f5f2ee]/30 text-[#151515] dark:text-[#f5f2ee] ic-mono text-[11px]"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-[#151515]/10 dark:border-[#f5f2ee]/10 px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <span className="ic-mono text-[12px] text-[#151515] dark:text-[#f5f2ee]">
              Subtotal
            </span>
            <span className="ic-mono text-[14px] text-[#151515] dark:text-[#f5f2ee]">
              ₱{subtotal}
            </span>
          </div>
          <button
            onClick={proceed}
            disabled={items.length === 0}
            className="w-full ic-mono text-[12px] px-4 py-[17px] bg-[#24170f] text-[#ffffff] disabled:opacity-30 hover:opacity-90 transition-opacity"
          >
            Proceed to Pre-Order
          </button>
        </div>
      </aside>
    </>
  );
}

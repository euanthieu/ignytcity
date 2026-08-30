import { create } from "zustand";
import { CartLine, ProductSize } from "../types";

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  addLine: (productId: string, size: ProductSize) => void;
  removeLine: (productId: string, size: ProductSize) => void;
  setQty: (productId: string, size: ProductSize, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  lines: [],
  isOpen: false,
  addLine: (productId, size) =>
    set((state) => {
      const existing = state.lines.find(
        (l) => l.productId === productId && l.size === size,
      );
      if (existing) {
        return {
          lines: state.lines.map((l) =>
            l.productId === productId && l.size === size
              ? { ...l, qty: l.qty + 1 }
              : l,
          ),
          isOpen: true,
        };
      }
      return {
        lines: [...state.lines, { productId, size, qty: 1 }],
        isOpen: true,
      };
    }),
  removeLine: (productId, size) =>
    set((state) => ({
      lines: state.lines.filter(
        (l) => !(l.productId === productId && l.size === size),
      ),
    })),
  setQty: (productId, size, qty) =>
    set((state) => ({
      lines: state.lines
        .map((l) =>
          l.productId === productId && l.size === size ? { ...l, qty } : l,
        )
        .filter((l) => l.qty > 0),
    })),
  clear: () => set({ lines: [] }),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

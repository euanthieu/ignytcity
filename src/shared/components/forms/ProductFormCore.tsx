"use client";

import React from "react";
import { AlertCircle, Sparkles } from "lucide-react";

export interface ProductFormValues {
  name: string;
  brand: string;
  description: string;
  price: number;
  stock: number;
  category?: string;
}

interface ProductFormCoreProps {
  values: ProductFormValues;
  errors: Record<string, string>;
  aiHighlights?: Record<string, boolean>;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
}

export function ProductFormCore({
  values,
  errors,
  aiHighlights = {},
  onChange,
}: ProductFormCoreProps) {
  const getFieldStyle = (fieldName: string) => {
    if (aiHighlights[fieldName]) {
      return {
        borderColor: "var(--brand-core)",
        boxShadow: "0 0 10px rgba(34, 211, 238, 0.15)",
      };
    }
    return { borderColor: "var(--border-light)" };
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
      {/* Product Name */}
      <div className="space-y-1 sm:col-span-2">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Product Name
          </label>
          {aiHighlights.name && (
            <span className="text-[9px] font-black text-[var(--brand-core)] flex items-center gap-0.5 animate-fade-in">
              <Sparkles className="w-2.5 h-2.5" /> AI Populated
            </span>
          )}
        </div>
        <input
          type="text"
          name="name"
          placeholder="e.g., Wireless Mechanical Keyboard"
          value={values.name}
          onChange={onChange}
          className="w-full px-3 py-2.5 border rounded-xl text-xs bg-transparent focus:outline-none focus:border-[var(--brand-core)] transition-all text-[var(--text-primary)]"
          style={getFieldStyle("name")}
        />
        {errors.name && (
          <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1">
            <AlertCircle className="w-3 h-3" /> {errors.name}
          </p>
        )}
      </div>

      {/* Brand Name */}
      <div className="space-y-1 sm:col-span-2">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Brand Name
          </label>
          {aiHighlights.brand && (
            <span className="text-[9px] font-black text-[var(--brand-core)] flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" /> AI Populated
            </span>
          )}
        </div>
        <input
          type="text"
          name="brand"
          placeholder="e.g., Logitech, Apple"
          value={values.brand}
          onChange={onChange}
          className="w-full px-3 py-2.5 border rounded-xl text-xs bg-transparent focus:outline-none focus:border-[var(--brand-core)] transition-all text-[var(--text-primary)]"
          style={getFieldStyle("brand")}
        />
        {errors.brand && (
          <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1">
            <AlertCircle className="w-3 h-3" /> {errors.brand}
          </p>
        )}
      </div>

      {/* Price */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Price ($)
          </label>
          {aiHighlights.price && (
            <span className="text-[9px] font-black text-[var(--brand-core)] flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" /> AI Populated
            </span>
          )}
        </div>
        <input
          type="number"
          step="0.01"
          name="price"
          placeholder="0.00"
          value={values.price || ""}
          onChange={onChange}
          className="w-full px-3 py-2.5 border rounded-xl text-xs bg-transparent focus:outline-none focus:border-[var(--brand-core)] transition-all text-[var(--text-primary)]"
          style={getFieldStyle("price")}
        />
      </div>

      {/* Initial Stock */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Initial Stock
          </label>
          {aiHighlights.stock && (
            <span className="text-[9px] font-black text-[var(--brand-core)] flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" /> AI Populated
            </span>
          )}
        </div>
        <input
          type="number"
          name="stock"
          placeholder="0"
          value={values.stock || ""}
          onChange={onChange}
          className="w-full px-3 py-2.5 border rounded-xl text-xs bg-transparent focus:outline-none focus:border-[var(--brand-core)] transition-all text-[var(--text-primary)]"
          style={getFieldStyle("stock")}
        />
      </div>

      {/* Category */}
      <div className="space-y-1 sm:col-span-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          Category
        </label>
        <select
          name="category"
          value={values.category || "Electronics"}
          onChange={onChange}
          className="w-full px-3 py-2.5 border rounded-xl text-xs bg-[var(--background-primary)] focus:outline-none focus:border-[var(--brand-core)] transition-all text-[var(--text-primary)] appearance-none cursor-pointer"
          style={{ borderColor: "var(--border-light)" }}
        >
          <option value="Electronics">Electronics</option>
          <option value="Apparel">Apparel</option>
          <option value="Home & Kitchen">Home & Kitchen</option>
          <option value="Groceries">Groceries</option>
        </select>
      </div>

      {/* Product Description */}
      <div className="space-y-1 sm:col-span-2">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Product Description
          </label>
          {aiHighlights.description && (
            <span className="text-[9px] font-black text-[var(--brand-core)] flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" /> AI Populated
            </span>
          )}
        </div>
        <textarea
          name="description"
          rows={4}
          placeholder="Describe your item details..."
          value={values.description}
          onChange={onChange}
          className="w-full px-3 py-2.5 border rounded-xl text-xs bg-transparent focus:outline-none focus:border-[var(--brand-core)] transition-all resize-none text-[var(--text-primary)]"
          style={getFieldStyle("description")}
        />
      </div>
    </div>
  );
}

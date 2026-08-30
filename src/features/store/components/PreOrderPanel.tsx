"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { useCartStore } from "../stores/cart.store";
import { PRODUCTS } from "../data/products";
import { compressImageToDataUrl, dataUrlToBase64 } from "../lib/compressImage";

type PaymentMethod = "gcash" | "bdo" | "in_person";

interface FormState {
  name: string;
  contact: string;
  address: string;
  notes: string;
  paymentMethod: PaymentMethod;
}

const EMPTY_FORM: FormState = {
  name: "",
  contact: "",
  address: "",
  notes: "",
  paymentMethod: "gcash",
};

const PICKUP_NOTE =
  "Pick up (and pay in person if you chose that option) on Sunday, September 6, 10AM–6PM at the 5th Floor, CAP Building.";

const SHIPPING_DISCLAIMER =
  "No shipping or delivery — pickup only, in person. Questions? DM @yth.ignyt on Instagram or Facebook, or call/text 0995 080 8552.";

export function PreOrderPanel() {
  const fileInputId = useId();
  const lines = useCartStore((s) => s.lines);
  const clearCart = useCartStore((s) => s.clear);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [screenshot, setScreenshot] = useState<{
    dataUrl: string;
    fileName: string;
  } | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    orderId: string;
    total: number;
    sheetSynced: boolean;
  } | null>(null);

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

  const total = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);

  const handleScreenshotChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageToDataUrl(file);
      setScreenshot({ dataUrl, fileName: file.name });
    } catch {
      setError("Couldn't read that image — try a different file.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (items.length === 0 || !form.name || !form.contact) return;
    if (form.paymentMethod !== "in_person" && !screenshot) {
      setError(
        "Please attach your payment screenshot, or choose to pay in person.",
      );
      return;
    }

    setStatus("submitting");

    const screenshotFields = screenshot
      ? dataUrlToBase64(screenshot.dataUrl)
      : null;

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          contact: form.contact,
          address: form.address || undefined,
          notes: form.notes || undefined,
          paymentMethod: form.paymentMethod,
          screenshotBase64: screenshotFields?.base64,
          screenshotMimeType: screenshotFields?.mimeType,
          items: items.map((i) => ({
            productId: i.product.id,
            productName: i.product.name,
            size: i.size,
            qty: i.qty,
            price: i.product.price,
          })),
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        throw new Error(
          body?.error || "Something went wrong. Please try again.",
        );
      }

      setResult(body);
      clearCart();
      setForm(EMPTY_FORM);
      setScreenshot(null);
      setStatus("idle");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
      setStatus("error");
    }
  };

  return (
    <section
      id="how-to-order"
      className="bg-[#ececec] dark:bg-[#1e1a17] py-16 sm:py-[64px]"
    >
      <div className="max-w-[720px] mx-auto px-5 sm:px-8">
        <div className="text-center mb-10">
          <p className="ic-mono text-[10px] tracking-[3px] text-[#151515]/60 dark:text-[#f5f2ee]/60 mb-3">
            Reserve Yours
          </p>
          <h2 className="ic-display text-[32px] sm:text-[40px] tracking-[3px] text-[#151515] dark:text-[#f5f2ee]">
            How to Pre-Order
          </h2>
          <p className="ic-mono text-[11px] normal-case tracking-normal text-[#151515]/60 dark:text-[#f5f2ee]/60 mt-3 max-w-md mx-auto leading-relaxed">
            Payment first — this locks in your size and gets your shirt into
            production. {PICKUP_NOTE}
          </p>
          <p className="ic-mono text-[10px] normal-case tracking-normal text-[#c0392b] mt-4 max-w-md mx-auto leading-relaxed">
            {SHIPPING_DISCLAIMER}
          </p>
        </div>

        {!result && (
          <form
            onSubmit={handleSubmit}
            className="bg-[#ffffff] dark:bg-[#14100d] p-6 sm:p-10 flex flex-col gap-5"
          >
            {items.length === 0 ? (
              <p className="ic-mono text-[12px] normal-case text-[#151515]/60 dark:text-[#f5f2ee]/60">
                Your order is empty. Add a tee from the drop above before
                submitting.
              </p>
            ) : (
              <div className="flex flex-col gap-2 pb-4 border-b border-[#151515]/10 dark:border-[#f5f2ee]/10">
                {items.map((i) => (
                  <div
                    key={`${i.productId}-${i.size}`}
                    className="flex justify-between ic-mono text-[11px] text-[#151515]/70 dark:text-[#f5f2ee]/70"
                  >
                    <span>
                      {i.qty}x {i.product.name} ({i.size})
                    </span>
                    <span>₱{i.product.price * i.qty}</span>
                  </div>
                ))}
                <div className="flex justify-between ic-mono text-[13px] text-[#151515] dark:text-[#f5f2ee] pt-2">
                  <span>Total</span>
                  <span>₱{total}</span>
                </div>
              </div>
            )}

            <label className="flex flex-col gap-2">
              <span className="ic-mono text-[10px] text-[#151515]/60 dark:text-[#f5f2ee]/60">
                Full Name
              </span>
              <input
                required
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className="ic-mono text-[13px] normal-case tracking-normal border border-[#151515]/30 dark:border-[#f5f2ee]/30 bg-transparent text-[#151515] dark:text-[#f5f2ee] px-4 py-3 focus:outline-none focus:border-[#151515] dark:focus:border-[#f5f2ee]"
                placeholder="Juan Dela Cruz"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="ic-mono text-[10px] text-[#151515]/60 dark:text-[#f5f2ee]/60">
                Contact Number
              </span>
              <input
                required
                value={form.contact}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contact: e.target.value }))
                }
                className="ic-mono text-[13px] normal-case tracking-normal border border-[#151515]/30 dark:border-[#f5f2ee]/30 bg-transparent text-[#151515] dark:text-[#f5f2ee] px-4 py-3 focus:outline-none focus:border-[#151515] dark:focus:border-[#f5f2ee]"
                placeholder="0917 000 0000"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="ic-mono text-[10px] text-[#151515]/60 dark:text-[#f5f2ee]/60">
                Notes
              </span>
              <textarea
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                rows={2}
                className="ic-mono text-[13px] normal-case tracking-normal border border-[#151515]/30 dark:border-[#f5f2ee]/30 bg-transparent text-[#151515] dark:text-[#f5f2ee] px-4 py-3 focus:outline-none focus:border-[#151515] dark:focus:border-[#f5f2ee] resize-none"
                placeholder="Optional"
              />
            </label>

            <div className="flex flex-col gap-3 pt-2 border-t border-[#151515]/10 dark:border-[#f5f2ee]/10">
              <span className="ic-mono text-[10px] text-[#151515]/60 dark:text-[#f5f2ee]/60">
                Payment
              </span>

              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { value: "gcash", label: "GCash" },
                    { value: "bdo", label: "BDO" },
                    { value: "in_person", label: "In Person" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, paymentMethod: opt.value }))
                    }
                    className={`ic-mono text-[11px] px-3 py-3 border transition-colors ${
                      form.paymentMethod === opt.value
                        ? "bg-[#24170f] text-[#ffffff] border-[#24170f]"
                        : "border-[#151515]/30 dark:border-[#f5f2ee]/30 text-[#151515]/70 dark:text-[#f5f2ee]/70"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {form.paymentMethod !== "in_person" && (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <span className="ic-mono text-[10px] text-[#151515]/50 dark:text-[#f5f2ee]/50">
                        GCash QR
                      </span>
                      <div className="relative w-full aspect-[700/1131] bg-[#ececec] dark:bg-[#1e1a17]">
                        <Image
                          src="/payment/payment-gcash.jpg"
                          alt="GCash payment QR code"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="ic-mono text-[10px] text-[#151515]/50 dark:text-[#f5f2ee]/50">
                        BDO QR
                      </span>
                      <div className="relative w-full aspect-[700/1277] bg-[#ececec] dark:bg-[#1e1a17]">
                        <Image
                          src="/payment/payment-bdo.jpg"
                          alt="BDO payment QR code"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="ic-mono text-[10px] text-[#151515]/60 dark:text-[#f5f2ee]/60">
                      Upload Payment Screenshot (
                      {form.paymentMethod === "gcash" ? "GCash" : "BDO"})
                    </span>
                    <input
                      id={fileInputId}
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotChange}
                      className="sr-only"
                    />
                    <label
                      htmlFor={fileInputId}
                      className="ic-mono text-[11px] normal-case tracking-normal border border-[#151515] dark:border-[#f5f2ee] text-[#151515] dark:text-[#f5f2ee] px-4 py-3 text-center cursor-pointer hover:bg-[#151515] hover:text-[#ffffff] dark:hover:bg-[#f5f2ee] dark:hover:text-[#14100d] transition-colors"
                    >
                      {screenshot
                        ? "Choose a Different Screenshot"
                        : "Choose Screenshot"}
                    </label>
                    {screenshot && (
                      <span className="ic-mono text-[10px] normal-case text-[#0073ff]">
                        Attached: {screenshot.fileName}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {form.paymentMethod === "in_person" && (
                <p className="ic-mono text-[11px] normal-case tracking-normal text-[#151515]/70 dark:text-[#f5f2ee]/70 bg-[#ececec] dark:bg-[#1e1a17] p-4">
                  {PICKUP_NOTE}
                </p>
              )}
            </div>

            {error && (
              <p className="ic-mono text-[11px] normal-case text-[#c0392b]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={items.length === 0 || status === "submitting"}
              className="ic-mono text-[12px] px-4 py-[17px] bg-[#24170f] text-[#ffffff] disabled:opacity-30 hover:opacity-90 transition-opacity mt-2"
            >
              {status === "submitting" ? "Submitting…" : "Reserve This Order"}
            </button>
          </form>
        )}

        {result && (
          <div className="bg-[#ffffff] dark:bg-[#14100d] p-6 sm:p-10 flex flex-col gap-4">
            <p className="ic-mono text-[12px] text-[#0073ff]">
              Order Reserved ✓
            </p>
            <p className="ic-mono text-[12px] normal-case tracking-normal text-[#151515]/70 dark:text-[#f5f2ee]/70 leading-relaxed">
              Order <strong>#{result.orderId.slice(0, 8)}</strong> — total{" "}
              <strong>₱{result.total}</strong>. {PICKUP_NOTE}
            </p>
            <p className="ic-mono text-[11px] normal-case tracking-normal text-[#0073ff] border border-[#0073ff] px-4 py-3 leading-relaxed">
              Screenshot this page or write down order #
              {result.orderId.slice(0, 8)} — you&apos;ll need it for tracking
              and pickup.
            </p>
            <p className="ic-mono text-[10px] normal-case tracking-normal text-[#c0392b] leading-relaxed">
              {SHIPPING_DISCLAIMER}
            </p>
            {!result.sheetSynced && (
              <p className="ic-mono text-[11px] normal-case text-[#151515]/50 dark:text-[#f5f2ee]/50">
                Your order is saved. We&apos;ll follow up if anything needs
                confirming.
              </p>
            )}
            <button
              onClick={() => setResult(null)}
              className="self-start ic-mono text-[11px] border border-[#151515] dark:border-[#f5f2ee] text-[#151515] dark:text-[#f5f2ee] px-5 py-3 hover:bg-[#151515] hover:text-[#ffffff] dark:hover:bg-[#f5f2ee] dark:hover:text-[#14100d] transition-colors mt-2"
            >
              Place another order
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

import { NextRequest } from "next/server";
import { z } from "zod";
import {
  getRedis,
  missingUpstashVars,
  UpstashNotConfiguredError,
} from "@/shared/lib/upstash";

export const runtime = "nodejs";

const OrderItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  size: z.string(),
  qty: z.number().int().positive(),
  price: z.number().positive(),
});

const OrderSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    contact: z.string().min(1, "Contact is required"),
    address: z.string().optional(),
    notes: z.string().optional(),
    paymentMethod: z.enum(["gcash", "bdo", "in_person"]),
    screenshotBase64: z.string().optional(),
    screenshotMimeType: z.string().optional(),
    items: z.array(OrderItemSchema).min(1, "Add at least one item"),
  })
  .refine(
    (data) =>
      data.paymentMethod === "in_person" || Boolean(data.screenshotBase64),
    {
      message: "A payment screenshot is required for GCash/BDO orders",
      path: ["screenshotBase64"],
    },
  );

/** Sheet sync is best-effort — it must never outlive the checkout request. */
const SHEET_SYNC_TIMEOUT_MS = 10_000;

/** Pushes one row per order line item to the Apps Script Web App bound to the pre-order sheet. */
async function syncToSheet(
  order: z.infer<typeof OrderSchema>,
  orderId: string,
): Promise<boolean> {
  const webAppUrl = process.env.GOOGLE_SHEETS_WEBAPP_URL?.trim();
  const secret = process.env.GOOGLE_SHEETS_SHARED_SECRET?.trim();
  if (!webAppUrl || !secret) {
    console.warn(
      "[orders] GOOGLE_SHEETS_WEBAPP_URL/SECRET not set — skipping sheet sync",
    );
    return false;
  }

  try {
    const results = await Promise.all(
      order.items.map((item) =>
        fetch(webAppUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            secret,
            orderId,
            name: order.name,
            contact: order.contact,
            size: item.size,
            design: item.productName,
            paymentMethod: order.paymentMethod,
            screenshotBase64: order.screenshotBase64,
            screenshotMimeType: order.screenshotMimeType,
          }),
          // A retired Apps Script deployment accepts the connection and never
          // answers. Without this the order request hangs until the platform
          // kills it, and the customer sees a failure for an order we already
          // saved. The sheet row is recoverable; the checkout is not.
          signal: AbortSignal.timeout(SHEET_SYNC_TIMEOUT_MS),
        }),
      ),
    );
    return results.every((r) => r.ok);
  } catch (err) {
    console.error("[orders] sheet sync failed", err);
    return false;
  }
}

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  if (!json) {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = OrderSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid order" },
      { status: 400 },
    );
  }

  const order = parsed.data;
  const total = order.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const orderId = crypto.randomUUID();
  const record = {
    ...order,
    orderId,
    total,
    createdAt: new Date().toISOString(),
  };

  try {
    const redis = getRedis();
    await redis.set(`order:${orderId}`, record);
    await redis.lpush("orders:index", orderId);
  } catch (err) {
    if (err instanceof UpstashNotConfiguredError) {
      console.error(
        `[orders] order storage is unconfigured — set ${err.missing.join(" and ")} in this deployment's environment, then redeploy`,
      );
      return Response.json(
        {
          error:
            "Order storage is not configured on this deployment. Please contact us to complete your order.",
          code: "storage_not_configured",
        },
        { status: 503 },
      );
    }

    console.error(
      "[orders] Upstash write failed",
      err instanceof Error ? `${err.name}: ${err.message}` : err,
    );
    return Response.json(
      {
        error: "Could not save your order right now. Please try again shortly.",
        code: "storage_write_failed",
      },
      { status: 500 },
    );
  }

  const sheetSynced = await syncToSheet(order, orderId);

  return Response.json({ orderId, total, sheetSynced });
}

/**
 * Config diagnostic. Reports only which variables are absent and whether a live
 * round-trip to Upstash succeeds — never the values themselves — so a broken
 * deployment can be identified from the browser.
 */
export async function GET() {
  const missing = missingUpstashVars();
  const sheetsConfigured = Boolean(
    process.env.GOOGLE_SHEETS_WEBAPP_URL?.trim() &&
    process.env.GOOGLE_SHEETS_SHARED_SECRET?.trim(),
  );

  if (missing.length > 0) {
    return Response.json(
      {
        ok: false,
        storage: "not_configured",
        missingEnvVars: missing,
        sheetsConfigured,
      },
      { status: 503 },
    );
  }

  try {
    const redis = getRedis();
    const probe = `orders:healthcheck:${crypto.randomUUID()}`;
    await redis.set(probe, "ok", { ex: 60 });
    await redis.del(probe);
  } catch (err) {
    return Response.json(
      {
        ok: false,
        storage: "unreachable",
        reason:
          err instanceof Error ? `${err.name}: ${err.message}` : "unknown",
        sheetsConfigured,
      },
      { status: 503 },
    );
  }

  return Response.json({ ok: true, storage: "ready", sheetsConfigured });
}

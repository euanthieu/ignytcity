import { NextRequest } from "next/server";
import { z } from "zod";
import { getRedis } from "@/shared/lib/upstash";

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

/** Pushes one row per order line item to the Apps Script Web App bound to the pre-order sheet. */
async function syncToSheet(
  order: z.infer<typeof OrderSchema>,
  orderId: string,
): Promise<boolean> {
  const webAppUrl = process.env.GOOGLE_SHEETS_WEBAPP_URL;
  const secret = process.env.GOOGLE_SHEETS_SHARED_SECRET;
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
    console.error("[orders] Upstash write failed", err);
    return Response.json(
      {
        error: "Could not save your order right now. Please try again shortly.",
      },
      { status: 500 },
    );
  }

  const sheetSynced = await syncToSheet(order, orderId);

  return Response.json({ orderId, total, sheetSynced });
}

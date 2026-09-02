import { NextRequest } from "next/server";
import { z } from "zod";
import {
  getRedis,
  missingUpstashVars,
  UpstashNotConfiguredError,
} from "@/shared/lib/upstash";

export const runtime = "nodejs";

/**
 * The sheet round-trip runs inside the checkout request, and Apps Script is
 * markedly slower from Vercel than from a local machine. The default function
 * budget was cutting the sync off before it finished.
 */
export const maxDuration = 30;

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
    socialMedia: z.string().min(1, "Social media account is required"),
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

/**
 * Apps Script web apps can only answer 200, so a rejected shared secret comes
 * back as an ordinary response carrying {ok:false}. Only an explicit rejection
 * counts as failure: a deployment predating docs/apps-script/Code.gs answers
 * with something else entirely, and its rows do land.
 */
function isRejected(body: string): boolean {
  try {
    const parsed: unknown = JSON.parse(body);
    return (
      typeof parsed === "object" &&
      parsed !== null &&
      "ok" in parsed &&
      (parsed as { ok: unknown }).ok === false
    );
  } catch {
    return false;
  }
}

/**
 * Sheet sync is best-effort — it must never outlive the checkout request.
 * Measured round-trip is 2-4s, but Apps Script cold starts and the script lock
 * push the tail well past 10s, which was dropping rows for orders that had
 * already been paid for.
 */
const SHEET_SYNC_TIMEOUT_MS = 20_000;

/** Pushes one row per order line item to the Apps Script Web App bound to the pre-order sheet. */
async function syncToSheet(
  order: z.infer<typeof OrderSchema>,
  orderId: string,
): Promise<{ synced: boolean; detail: string }> {
  const webAppUrl = process.env.GOOGLE_SHEETS_WEBAPP_URL?.trim();
  const secret = process.env.GOOGLE_SHEETS_SHARED_SECRET?.trim();
  if (!webAppUrl || !secret) {
    console.warn(
      "[orders] GOOGLE_SHEETS_WEBAPP_URL/SECRET not set — skipping sheet sync",
    );
    return { synced: false, detail: "not_configured" };
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
            socialMedia: order.socialMedia,
            notes: order.notes,
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
    const bad = results.find((r) => !r.ok);
    if (bad) {
      // Apps Script answers a rejected request with 200 + an error body just as
      // often as a 4xx, so record the body too — a mismatched shared secret is
      // otherwise indistinguishable from success.
      const body = await bad.text().catch(() => "");
      console.error(
        `[orders] sheet sync rejected: HTTP ${bad.status} ${body.slice(0, 200)}`,
      );
      return { synced: false, detail: `http_${bad.status}` };
    }
    const bodies = await Promise.all(
      results.map((r) => r.text().catch(() => "")),
    );
    const rejection = bodies.find(isRejected);
    if (rejection !== undefined) {
      console.error(
        `[orders] sheet sync rejected by Apps Script: ${rejection.slice(0, 200)}`,
      );
      return { synced: false, detail: "rejected" };
    }

    return { synced: true, detail: "ok" };
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "TimeoutError";
    console.error("[orders] sheet sync failed", err);
    return { synced: false, detail: timedOut ? "timeout" : "network_error" };
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

  const sheet = await syncToSheet(order, orderId);

  return Response.json({
    orderId,
    total,
    sheetSynced: sheet.synced,
    sheetDetail: sheet.detail,
  });
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

/**
 * IGNYT CITY — pre-order intake.
 *
 * Bound to the "Ignyt City Pre Order" spreadsheet. The storefront's
 * /api/orders route POSTs one request per order line item, so a two-item
 * order arrives as two concurrent requests sharing an orderId.
 *
 * Deploy: Deploy > Manage deployments > edit the existing deployment >
 * Version: New version. That keeps the same /exec URL, so nothing in Vercel
 * changes. Creating a *new* deployment mints a new URL and breaks the site.
 *
 * Columns, in order: NAME | SIZE | DESIGN | CONTACT NO. | PAYMENT STATUS |
 * SCREENSHOT | ORDER # | SOCIAL MEDIA ACCOUNT | NOTES
 */

/** Must match GOOGLE_SHEETS_SHARED_SECRET in Vercel and .env.local. */
const SHARED_SECRET = "PASTE_YOUR_SECRET_HERE";

/** Leave blank to use the first tab. */
const SHEET_NAME = "";

/** Created on first use if missing. */
const SCREENSHOT_FOLDER = "Ignyt City Payment Screenshots";

const PICKUP_NOTE =
  "PAY IN PERSON — pickup Sun Sept 6, 5th Flr CAP Building";

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return reply({ ok: false, error: "empty_body" });
    }

    const data = JSON.parse(e.postData.contents);

    // Constant-time-ish check is overkill here, but a plain mismatch must
    // never fall through to a write.
    if (!SHARED_SECRET || data.secret !== SHARED_SECRET) {
      return reply({ ok: false, error: "unauthorized" });
    }

    // Uploading is slow, so do it before taking the lock. Screenshots are
    // keyed by orderId: every line item of an order carries the same image,
    // and without this a 3-item order would upload three copies.
    const screenshot = saveScreenshot(data);

    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      sheet().appendRow([
        data.name || "",
        data.size || "",
        data.design || "",
        // Leading apostrophe forces text. Without it Sheets reads "09171234567"
        // as a number and silently eats the leading zero.
        "'" + (data.contact || ""),
        paymentStatus(data.paymentMethod),
        screenshot ? '=HYPERLINK("' + screenshot + '","View Screenshot")' : "",
        "'" + String(data.orderId || "").slice(0, 8),
        data.socialMedia || "",
        data.notes || "",
      ]);
    } finally {
      lock.releaseLock();
    }

    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  }
}

/** Lets you confirm from a browser that this deployment is reachable. */
function doGet() {
  return reply({ ok: true, service: "ignyt-city-preorder" });
}

function sheet() {
  const ss = SpreadsheetApp.getActive();
  return (SHEET_NAME && ss.getSheetByName(SHEET_NAME)) || ss.getSheets()[0];
}

function paymentStatus(method) {
  if (method === "in_person") return PICKUP_NOTE;
  return "PAID (" + (method || "unknown") + ")";
}

/**
 * Writes the payment screenshot to Drive and returns a viewable link.
 * Returns "" when the order has no screenshot (pay-in-person).
 */
function saveScreenshot(data) {
  if (!data.screenshotBase64) return "";

  const folder = screenshotFolder();
  const name = (data.orderId || Utilities.getUuid()) + ".jpg";

  // Another line item of the same order may have uploaded it already.
  const existing = folder.getFilesByName(name);
  if (existing.hasNext()) return existing.next().getUrl();

  const blob = Utilities.newBlob(
    Utilities.base64Decode(data.screenshotBase64),
    data.screenshotMimeType || "image/jpeg",
    name,
  );

  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}

function screenshotFolder() {
  const found = DriveApp.getFoldersByName(SCREENSHOT_FOLDER);
  return found.hasNext() ? found.next() : DriveApp.createFolder(SCREENSHOT_FOLDER);
}

/**
 * Apps Script web apps always answer 200 — there is no way to return a 4xx.
 * The caller therefore has to read this body to tell success from failure,
 * which is why every path returns {ok: boolean}.
 */
function reply(payload) {
  return ContentService.createTextOutput(
    JSON.stringify(payload),
  ).setMimeType(ContentService.MimeType.JSON);
}

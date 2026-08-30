import { ApiError } from "./api-error";

/**
 * Logs every caught error, not just classified ApiErrors — a plain thrown
 * Error (still common in legacy feature api files) used to be silently
 * dropped here. Swap the console.log for a real APM/error-tracking call
 * (Sentry, Datadog, etc.) before production.
 */
export function logError(error: unknown) {
  if (error instanceof ApiError) {
    console.log("[ERROR]", {
      category: error.category,
      code: error.code,
      status: error.status,
    });
    return;
  }

  console.log("[ERROR] (unclassified)", error);
}

import { ApiError } from "./api-error";

export function getRetryCount(error: unknown): number {
  if (!(error instanceof ApiError)) return 0;

  if (error.category === "NETWORK") return 3;
  if (error.status && error.status >= 500) return 2;
  if (error.status === 429) return 1;

  return 0;
}

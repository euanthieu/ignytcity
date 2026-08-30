import { describe, it, expect } from "vitest";
import { getRetryCount } from "@/shared/errors/retry-policy";
import { ApiError } from "@/shared/errors/api-error";

describe("getRetryCount", () => {
  it("returns 3 retries for NETWORK errors", () => {
    const err = new ApiError("Network error", "NETWORK");
    expect(getRetryCount(err)).toBe(3);
  });

  it("returns 2 retries for 500 SERVER errors", () => {
    const err = new ApiError("Server error", "SERVER", { status: 500 });
    expect(getRetryCount(err)).toBe(2);
  });

  it("returns 2 retries for 503 errors", () => {
    const err = new ApiError("Service unavailable", "SERVER", { status: 503 });
    expect(getRetryCount(err)).toBe(2);
  });

  it("returns 0 retries for AUTH (401) errors — must not retry", () => {
    const err = new ApiError("Unauthorized", "AUTH", { status: 401 });
    expect(getRetryCount(err)).toBe(0);
  });

  it("returns 0 retries for FORBIDDEN (403) errors — must not retry", () => {
    const err = new ApiError("Forbidden", "FORBIDDEN", { status: 403 });
    expect(getRetryCount(err)).toBe(0);
  });

  it("returns 0 retries for VALIDATION (422) errors", () => {
    const err = new ApiError("Validation failed", "VALIDATION", {
      status: 422,
    });
    expect(getRetryCount(err)).toBe(0);
  });

  it("returns 0 retries for NOT_FOUND (404) errors", () => {
    const err = new ApiError("Not found", "NOT_FOUND", { status: 404 });
    expect(getRetryCount(err)).toBe(0);
  });

  it("returns 0 retries for non-ApiError errors (unknown errors)", () => {
    expect(getRetryCount(new Error("generic"))).toBe(0);
    expect(getRetryCount("string error")).toBe(0);
    expect(getRetryCount(null)).toBe(0);
  });
});

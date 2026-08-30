import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetcher } from "@/shared/lib/http";
import { ApiError } from "@/shared/errors/api-error";

// ── Helpers ─────────────────────────────────────────────────────────────────
function mockFetch(status: number, body?: object) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(),
    json: async () => body ?? {},
  });
}

function mockNetworkFailure() {
  global.fetch = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
}

// ── Tests ────────────────────────────────────────────────────────────────────
describe("fetcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns parsed JSON on a 200 response", async () => {
    mockFetch(200, { id: "1", name: "Alice" });
    const result = await fetcher("/api/users");
    expect(result).toEqual({ id: "1", name: "Alice" });
  });

  it("resolves to undefined on a 204 No Content response (does not call json)", async () => {
    const json = vi.fn();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      headers: new Headers(),
      json,
    });
    const result = await fetcher("/api/posts/1", { method: "DELETE" });
    expect(result).toBeUndefined();
    expect(json).not.toHaveBeenCalled();
  });

  it("attaches Authorization header when a token is in sessionStorage", async () => {
    sessionStorage.setItem("token", "test-token-123");
    mockFetch(200, {});
    await fetcher("/api/users");

    const callHeaders = (global.fetch as ReturnType<typeof vi.fn>).mock
      .calls[0][1]?.headers;
    expect(callHeaders?.Authorization).toBe("Bearer test-token-123");
  });

  it("does NOT attach Authorization header when no token is stored", async () => {
    mockFetch(200, {});
    await fetcher("/api/users");

    const callHeaders = (global.fetch as ReturnType<typeof vi.fn>).mock
      .calls[0][1]?.headers;
    expect(callHeaders?.Authorization).toBeUndefined();
  });

  it("throws ApiError with AUTH category on 401", async () => {
    mockFetch(401, { message: "Unauthorized" });
    await expect(fetcher("/api/protected")).rejects.toMatchObject({
      category: "AUTH",
      status: 401,
    });
  });

  it("throws ApiError with FORBIDDEN category on 403", async () => {
    mockFetch(403, { message: "Forbidden" });
    await expect(fetcher("/api/admin")).rejects.toMatchObject({
      category: "FORBIDDEN",
      status: 403,
    });
  });

  it("throws ApiError with NOT_FOUND category on 404", async () => {
    mockFetch(404, { message: "Not Found" });
    await expect(fetcher("/api/missing")).rejects.toMatchObject({
      category: "NOT_FOUND",
      status: 404,
    });
  });

  it("throws ApiError with VALIDATION category on 422", async () => {
    mockFetch(422, {
      message: "Validation failed",
      details: { email: ["is invalid"] },
    });
    const error: any = await fetcher("/api/form").catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.category).toBe("VALIDATION");
    expect(error.details).toEqual({ email: ["is invalid"] });
  });

  it("throws ApiError with SERVER category on 500", async () => {
    mockFetch(500, { message: "Internal Server Error" });
    await expect(fetcher("/api/crash")).rejects.toMatchObject({
      category: "SERVER",
      status: 500,
    });
  });

  it("throws ApiError with NETWORK category on fetch TypeError", async () => {
    mockNetworkFailure();
    const error: any = await fetcher("/api/users").catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.category).toBe("NETWORK");
    expect(error.message).toBe("Network error");
  });

  it("preserves the error message from the API response body", async () => {
    mockFetch(400, { message: "Bad request: missing field" });
    const error: any = await fetcher("/api/users").catch((e) => e);
    expect(error.message).toBe("Bad request: missing field");
  });
});

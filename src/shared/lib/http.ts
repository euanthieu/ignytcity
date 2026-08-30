import { ApiError } from "@/shared/errors/api-error";
import { env } from "@/shared/lib/env";
import {
  getToken,
  getRefreshToken,
  setToken,
  clearToken,
} from "@/shared/lib/token";

function classify(
  status: number,
):
  | "AUTH"
  | "FORBIDDEN"
  | "VALIDATION"
  | "NOT_FOUND"
  | "SERVER"
  | "NETWORK"
  | "UNKNOWN" {
  if (status === 401) return "AUTH";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 422) return "VALIDATION";
  if (status >= 500) return "SERVER";
  return "UNKNOWN";
}

let isRefreshing = false;
let refreshSubscribers: ((newToken: string) => void)[] = [];

let onTokenRefreshCallback:
  ((token: string, refreshToken?: string) => void) | null = null;
export function setOnTokenRefresh(
  cb: (token: string, refreshToken?: string) => void,
) {
  onTokenRefreshCallback = cb;
}

let onTokenClearCallback: (() => void) | null = null;
export function setOnTokenClear(cb: () => void) {
  onTokenClearCallback = cb;
}

function onRefreshed(newToken: string) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

async function tryRefreshToken(): Promise<string | null> {
  const existingRefreshToken = getRefreshToken();
  if (!existingRefreshToken) return null;

  try {
    const res = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken: existingRefreshToken }),
      },
    );

    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.data;
    const newAccessToken = data?.accessToken;
    const newRefreshToken = data?.refreshToken || existingRefreshToken;

    if (newAccessToken) {
      setToken(newAccessToken, newRefreshToken);
      if (onTokenRefreshCallback) {
        onTokenRefreshCallback(newAccessToken, newRefreshToken);
      }
      return newAccessToken;
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetcher<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  try {
    const token = getToken();
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(env.NEXT_PUBLIC_API_URL.includes("ngrok")
        ? { "ngrok-skip-browser-warning": "true" }
        : {}),
      ...(options?.headers || {}),
    };

    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}${url}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let payload: any = null;

      try {
        payload = await res.json();
      } catch {}

      const category = classify(res.status);
      const message = payload?.message || "Request failed";

      const isAuthError =
        res.status === 401 ||
        (typeof message === "string" &&
          (message.toLowerCase().includes("invalid token") ||
            message.toLowerCase().includes("user not found") ||
            message.toLowerCase().includes("deactivated") ||
            message.toLowerCase().includes("unauthorized")));

      // Attempt automatic JWT refresh token rotation before forcing a logout
      if (
        isAuthError &&
        !url.includes("/auth/refresh-token") &&
        !url.includes("/auth/login")
      ) {
        const storedRefreshToken = getRefreshToken();
        if (storedRefreshToken) {
          if (!isRefreshing) {
            isRefreshing = true;
            const newToken = await tryRefreshToken();
            isRefreshing = false;

            if (newToken) {
              onRefreshed(newToken);
              return fetcher<T>(url, options);
            }
          } else {
            // Queue concurrent requests while token refresh is in flight
            return new Promise((resolve, reject) => {
              refreshSubscribers.push((newToken: string) => {
                fetcher<T>(url, {
                  ...options,
                  headers: {
                    ...options?.headers,
                    Authorization: `Bearer ${newToken}`,
                  },
                })
                  .then(resolve)
                  .catch(reject);
              });
            });
          }
        }

        // Refresh failed or no refresh token exists -> clear tokens and redirect
        if (typeof window !== "undefined") {
          clearToken();
          localStorage.removeItem("active_store_context_id");
          if (onTokenClearCallback) {
            onTokenClearCallback();
          }

          if (!window.location.pathname.startsWith("/login")) {
            window.location.href = "/login";
          }
        }
      }

      throw new ApiError(message, category, {
        status: res.status,
        code: payload?.code,
        details: payload?.details,
      });
    }

    if (res.status === 204 || res.headers.get("content-length") === "0") {
      return undefined as T;
    }

    return res.json();
  } catch (err: any) {
    if (err instanceof TypeError) {
      throw new ApiError("Network error", "NETWORK");
    }
    throw err;
  }
}

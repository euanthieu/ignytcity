// src/features/auth/api/login.api.ts
import { fetcher } from "@/shared/lib/http";
import {
  LoginResponseEnvelopeSchema,
  AuthResultSchema,
  type AuthResult,
} from "../contracts/auth.contract";

// Unified type definitions
export type UserRole = "BUYER" | "SELLER" | "ADMIN" | "SUPPORT_AGENT";

interface AuthResponse {
  accessToken: string;
  hasStoreBranches?: boolean;
}

/**
 * Unified Unified Login Handler
 * Replaces both loginBuyer and loginSeller
 */
export const login = async (
  credentials: Record<string, string>,
  roleName: UserRole,
): Promise<AuthResult> => {
  const raw = await fetcher<unknown>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({
      ...credentials,
      roleName, // Injected dynamically ("BUYER" or "SELLER")
    }),
  });

  const envelope = LoginResponseEnvelopeSchema.parse(raw);
  return AuthResultSchema.parse({
    accessToken: envelope.data.accessToken,
    refreshToken: envelope.data.refreshToken,
    hasStores: Array.isArray(envelope.data.stores)
      ? envelope.data.stores.length > 0
      : false,
    user: envelope.data.user,
    seller: envelope.data.seller,
  });
};

/**
 * Unified Registration Handler
 * Replaces both registerBuyer and registerSeller
 */
export const register = async (
  userData: Record<string, string>,
  roleName: UserRole,
) => {
  const res = await fetcher<{ data: AuthResponse }>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({
      ...userData,
      roleName, // Injected dynamically ("BUYER" or "SELLER")
    }),
  });

  // Safe navigation in case your backend registration doesn't return data (like in your controller)
  return {
    accessToken: res?.data?.accessToken,
    hasStoreBranches: res?.data?.hasStoreBranches,
  };
};

/**
 * Universal Global Logout Handler
 */
export const logout = async () => {
  return fetcher("/api/v1/auth/logout", {
    method: "POST",
  });
};

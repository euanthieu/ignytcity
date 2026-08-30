"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/shared/lib/token";

interface TokenClaims {
  userId: string | null;
  roles: string[];
}

function decodeToken(token: string): TokenClaims | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    const claims = JSON.parse(jsonPayload);
    return {
      userId: claims.userId ?? null,
      roles: Array.isArray(claims.roles) ? claims.roles : [],
    };
  } catch {
    return null;
  }
}

/**
 * Reads the signed-in user's claims from the access token. Decoding happens in
 * an effect so the first server/client render always agree — read `isHydrated`
 * before branching on `userId`.
 */
export function useCurrentUser() {
  const [claims, setClaims] = useState<TokenClaims | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const token = getToken();
    setClaims(token ? decodeToken(token) : null);
    setIsHydrated(true);
  }, []);

  return {
    userId: claims?.userId ?? null,
    roles: claims?.roles ?? [],
    isHydrated,
  };
}

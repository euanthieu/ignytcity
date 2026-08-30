"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../stores/auth.store";
import { clearAuthSession } from "../hooks/useAuth";

export function AuthListener() {
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleUnauthorized = () => {
      clearAuthSession(setToken, queryClient);
      router.push("/login");
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [router, setToken, queryClient]);

  return null;
}

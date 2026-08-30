"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../stores/auth.store";
import { useAuth } from "../hooks/useAuth";

export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  const { logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!token) {
      router.push("/login");
    }
  }, [router, token]);

  if (!mounted) return null;

  return <>{children}</>;
}

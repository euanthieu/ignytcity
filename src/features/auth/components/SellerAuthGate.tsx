"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SellerLayout } from "@/shared/components/layout/SellerLayout";
import { useAuthStore } from "../stores/auth.store";
import { useAuth } from "../hooks/useAuth";

export function SellerAuthGate({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  const { logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !token) {
      router.replace("/login");
    }
  }, [mounted, router, token]);

  const handleSignOut = async () => {
    try {
      await logout();
    } finally {
      router.push("/login");
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <SellerLayout isAuthenticated={!!token} onSignOut={handleSignOut}>
      {children}
    </SellerLayout>
  );
}

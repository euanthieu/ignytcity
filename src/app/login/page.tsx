"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/features/auth/components/LoginForm";
import type { LoginRole } from "@/features/auth/types";
import { Card } from "@/shared/components/ui/Card";
import { SmartphoneIcon } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [buyerLoggedIn, setBuyerLoggedIn] = useState(false);

  const handleLoginSuccess = (
    role: LoginRole,
    hasStores: boolean,
    seller?: { isOnboarded: boolean; onboardingStep: number },
  ) => {
    if (role === "admin") {
      router.push("/admin");
      return;
    }
    if (role === "seller") {
      const isReadyForDashboard = hasStores && seller?.isOnboarded === true;

      router.push(
        isReadyForDashboard ? "/seller/manage-stores" : "/seller/onboarding",
      );
      return;
    }
    if (role === "support_agent") {
      router.push("/agent");
      return;
    }
    setBuyerLoggedIn(true);
  };

  if (buyerLoggedIn) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[var(--background-primary)]">
        <Card className="w-full max-w-md p-6 text-center">
          <SmartphoneIcon className="mx-auto mb-4 h-12 w-12 text-[var(--brand-core)]" />
          <h2 className="text-lg font-semibold mb-2">Login Successful!</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            You have successfully logged in as a buyer. Please check your email
            for further instructions to access the buyer dashboard.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[var(--background-primary)]">
      <div className="text-center space-y-1 mb-6">
        <div className="text-xl font-black tracking-tight">
          Map<span className="text-[var(--brand-core)]">Central</span>
        </div>
      </div>
      <LoginForm onLoginSuccess={handleLoginSuccess} />
    </div>
  );
}

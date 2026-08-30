"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { toast } from "sonner";
import { Card } from "@/shared/components/ui/Card";
import { User, ShieldCheck, Smartphone } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import type { UserRole as ApiUserRole } from "../api/login.api";

type AuthStep = "ROLE_SELECT" | "FIELDS_FORM" | "BUYER_APP_PROMPT";
type UserRole = "buyer" | "seller";

export default function RegisterWorkflow({
  onCompleteSeller,
}: {
  onCompleteSeller: () => void;
}) {
  const [step, setStep] = useState<AuthStep>("ROLE_SELECT");
  const [role, setRole] = useState<UserRole | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const { register, isRegistering } = useAuth();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setStep("FIELDS_FORM");
  };

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!role) return;

    try {
      await register(
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        },
        role.toUpperCase() as ApiUserRole,
      );
      if (role === "buyer") {
        setStep("BUYER_APP_PROMPT");
      } else {
        onCompleteSeller();
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Registration failed. Try again.",
      );
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-4 text-left">
      {step === "ROLE_SELECT" && (
        <Card className="p-6 space-y-4">
          <div className="text-center">
            <h2 className="text-lg font-black tracking-tight">
              Create Your NextTemplate Account
            </h2>
            <p className="text-xs text-zinc-400">
              Select your workspace interface to register
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => handleRoleSelect("buyer")}
              className="flex items-center gap-4 p-4 border rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              style={{ borderColor: "var(--border-light)" }}
            >
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500">
                <User className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold">Register as a Buyer</div>
                <p className="text-[10px] text-zinc-400">
                  Explore hyper-local networks, view physical markers, and place
                  local pick-ups.
                </p>
              </div>
            </button>

            <button
              onClick={() => handleRoleSelect("seller")}
              className="flex items-center gap-4 p-4 border rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              style={{ borderColor: "var(--border-light)" }}
            >
              <div className="p-2.5 rounded-lg bg-brand-core/10 text-zinc-900 dark:text-zinc-100">
                <ShieldCheck
                  className="w-5 h-5"
                  style={{ color: "var(--brand-core)" }}
                />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold">
                  Register as a Verified Merchant
                </div>
                <p className="text-[10px] text-zinc-400">
                  Map store coordinates, drop cloud catalog layers, and service
                  offline commerce.
                </p>
              </div>
            </button>
          </div>
        </Card>
      )}

      {step === "FIELDS_FORM" && (
        <Card className="p-6">
          <div className="mb-4">
            <h2 className="text-base font-black">Account Parameters</h2>
            <p className="text-xs text-zinc-400">
              Registering account layout profile as a{" "}
              <span className="font-bold text-zinc-600 dark:text-zinc-300 capitalize">
                {role}
              </span>
            </p>
          </div>
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-background focus:outline-none"
                  style={{ borderColor: "var(--border-light)" }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-background focus:outline-none"
                  style={{ borderColor: "var(--border-light)" }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="name@domain.com"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-xl text-xs bg-background focus:outline-none"
                style={{ borderColor: "var(--border-light)" }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={8}
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-xl text-xs bg-background focus:outline-none"
                style={{ borderColor: "var(--border-light)" }}
              />
            </div>

            <button
              type="submit"
              disabled={isRegistering}
              className="w-full mt-2 py-2 text-xs font-bold rounded-xl text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isRegistering ? "Generating Credentials..." : "Create Account"}
            </button>
          </form>
        </Card>
      )}

      {step === "BUYER_APP_PROMPT" && (
        <Card className="p-6 text-center space-y-4 py-8 animate-in fade-in duration-300">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center mx-auto">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black">Download NextTemplate Mobile</h2>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto mt-1">
              Account successfully verified! To purchase, look up active store
              pins, and check out locally, please install our native mobile
              companion interface.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <a
              href="#app-store"
              className="w-full py-2 text-center text-xs font-bold border rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900"
              style={{ borderColor: "var(--border-light)" }}
            >
              Download on iOS App Store
            </a>
            <a
              href="#google-play"
              className="w-full py-2 text-center text-xs font-bold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-xl hover:opacity-90"
            >
              Get it on Google Play
            </a>
          </div>
        </Card>
      )}
    </div>
  );
}

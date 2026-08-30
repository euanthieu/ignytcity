"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { toast } from "sonner";
import { Card } from "@/shared/components/ui/Card";
import {
  LogIn,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Loader2,
  ShieldCheck,
  UserCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import type { UserRole as ApiUserRole } from "../api/login.api";
import type { LoginRole } from "../types";

export default function LoginForm({
  onLoginSuccess,
}: {
  onLoginSuccess: (
    role: LoginRole,
    hasStores: boolean,
    seller?: { isOnboarded: boolean; onboardingStep: number },
  ) => void;
}) {
  const [role, setRole] = useState<LoginRole>("seller");
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const { login, isLoggingIn } = useAuth();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!credentials.email.trim() || !credentials.password) {
      toast.error("Please provide both email and password.");
      return;
    }

    const toastId = toast.loading(
      `Connecting to authentication gateway (${role.toUpperCase()})...`,
    );
    setLoadingStep("Authenticating credentials...");

    try {
      setLoadingStep("Verifying account permissions...");
      const result = await login(
        credentials,
        role.toUpperCase() as ApiUserRole,
      );

      setLoadingStep("Loading workspace...");
      toast.success("Login verified! Redirecting to workspace...", {
        id: toastId,
      });

      setTimeout(() => {
        onLoginSuccess(role, result.hasStores, result.seller ?? undefined);
      }, 500);
    } catch (err) {
      setLoadingStep("");
      const message =
        err instanceof Error
          ? err.message
          : "Login failed. Please verify credentials.";
      toast.error(message, { id: toastId });
    }
  };

  return (
    <Card className="p-6 sm:p-8 max-w-md w-full mx-auto text-left shadow-2xl border border-[var(--border-default)] bg-[var(--background-elevated)]/90 backdrop-blur-xl relative overflow-hidden">
      {/* Decorative Top Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-cyan-400 to-indigo-500" />

      <div className="mb-6 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-400 text-white flex items-center justify-center mb-3 shadow-lg shadow-cyan-500/20">
          <LogIn className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-black tracking-tight text-[var(--text-primary)]">
          Welcome to NextTemplate
        </h2>
        <p className="text-xs text-[var(--text-tertiary)] mt-1">
          Select your role and sign in to access your portal
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div
        className="grid grid-cols-3 gap-1.5 p-1.5 mb-6 rounded-2xl border bg-[var(--background-secondary)]"
        style={{ borderColor: "var(--border-light)" }}
      >
        <button
          type="button"
          disabled={isLoggingIn}
          onClick={() => setRole("seller")}
          className={`py-2 text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 ${
            role === "seller"
              ? "bg-[var(--brand-core)] text-white shadow-md"
              : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Merchant
        </button>
        <button
          type="button"
          disabled={isLoggingIn}
          onClick={() => setRole("admin")}
          className={`py-2 text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 ${
            role === "admin"
              ? "bg-cyan-600 text-white shadow-md"
              : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Admin
        </button>
        <button
          type="button"
          disabled={isLoggingIn}
          onClick={() => setRole("support_agent")}
          className={`py-2 text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 ${
            role === "support_agent"
              ? "bg-[var(--brand-core)] text-white shadow-md"
              : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Agent
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input
              type="email"
              name="email"
              required
              disabled={isLoggingIn}
              placeholder="name@domain.com"
              value={credentials.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--background-primary)] text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--brand-core)] transition-colors disabled:opacity-60"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
              Password
            </label>
            <a
              href="#forgot"
              className="text-[10px] font-bold text-sky-400 hover:underline"
            >
              Forgot?
            </a>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              disabled={isLoggingIn}
              placeholder="••••••••"
              value={credentials.password}
              onChange={handleChange}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--background-primary)] text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--brand-core)] transition-colors disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button with Loader */}
        <button
          type="submit"
          disabled={isLoggingIn}
          className="w-full py-3 mt-2 font-extrabold text-xs rounded-xl text-white bg-[var(--brand-core)] hover:bg-sky-400 disabled:opacity-75 transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>{loadingStep || "Authenticating..."}</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Sign In as {role.toUpperCase()}</span>
            </>
          )}
        </button>

        {/* Visual Progress Status Indicator */}
        {isLoggingIn && (
          <div className="flex items-center justify-center gap-2 pt-2 text-[11px] font-semibold text-cyan-400 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            {loadingStep || "Processing authentication query..."}
          </div>
        )}
      </form>

      <div className="mt-6 text-center text-xs text-[var(--text-tertiary)]">
        {"Don't have an account?"}{" "}
        <Link
          href="/register"
          className="font-bold text-[var(--brand-core)] hover:underline"
        >
          Create account
        </Link>
      </div>
    </Card>
  );
}

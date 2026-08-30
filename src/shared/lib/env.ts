import { z } from "zod";

/**
 * FAOS — Environment Validation
 *
 * All environment variables must be declared here and validated via Zod.
 * The app will throw a clear error at startup if any required var is missing.
 * Never access `process.env` directly outside of this file.
 *
 * Usage: import { env } from "@/shared/lib/env";
 */
/** Treats an empty/blank string the same as an absent variable — Vercel's `--env FOO=` (empty secret) sets "", not undefined. */
const blankToUndefined = (val: unknown) =>
  typeof val === "string" && val.trim() === "" ? undefined : val;

const envSchema = z.object({
  // ── API ──────────────────────────────────────────────────────────────────
  /** Base URL of the backend REST API. Optional — unused by the storefront; only the legacy dashboard/seller features call it. */
  NEXT_PUBLIC_API_URL: z.preprocess(
    blankToUndefined,
    z
      .string()
      .url({
        message:
          "NEXT_PUBLIC_API_URL must be a valid URL (e.g. https://api.example.com).",
      })
      .optional()
      .default("http://localhost:3001"),
  ),

  // ── Site ─────────────────────────────────────────────────────────────────
  /** Canonical public URL of this frontend (used for OG tags, sitemap). Optional in dev. */
  NEXT_PUBLIC_SITE_URL: z.preprocess(
    blankToUndefined,
    z
      .string()
      .url({ message: "NEXT_PUBLIC_SITE_URL must be a valid URL." })
      .optional(),
  ),

  // ── Feature Flags ─────────────────────────────────────────────────────────
  /** Runtime environment name. Drives feature flag defaults. */
  NEXT_PUBLIC_APP_ENV: z.preprocess(
    blankToUndefined,
    z
      .enum(["development", "staging", "production"], {
        error:
          "NEXT_PUBLIC_APP_ENV must be one of: development, staging, production.",
      })
      .default("development"),
  ),
});

/**
 * Parsed, type-safe environment configuration.
 * Throws at module load time if validation fails — surfacing config issues early.
 */
function createEnv() {
  const result = envSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  });

  if (!result.success) {
    console.error("\n❌ Invalid environment configuration detected:\n");
    result.error.issues.forEach((issue) => {
      console.error(`  • [${issue.path.join(".")}]: ${issue.message}`);
    });
    console.error(
      "\n📄 Copy .env.example to .env.local and fill in the required values.\n",
    );
    throw new Error("Environment validation failed. See above for details.");
  }

  return result.data;
}

export const env = createEnv();

export type Env = z.infer<typeof envSchema>;

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    // ── Environment ──────────────────────────────────────────────────────────
    environment: "jsdom",

    // ── Setup ────────────────────────────────────────────────────────────────
    setupFiles: ["./vitest.setup.ts"],

    // ── Globals ──────────────────────────────────────────────────────────────
    // Allows using describe/it/expect without importing them
    globals: true,

    // ── Coverage ─────────────────────────────────────────────────────────────
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      exclude: [
        "node_modules/**",
        ".next/**",
        "**/*.config.*",
        "**/*.stories.*",
        "**/feature.manifest.ts",
        "e2e/**",
        "src/app/**", // App layer is thin — covered by E2E
      ],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 60,
        statements: 60,
      },
    },

    // ── Include / Exclude ────────────────────────────────────────────────────
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next", "e2e"],
  },

  // ── Path Aliases ─────────────────────────────────────────────────────────
  // Must match tsconfig.json paths
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

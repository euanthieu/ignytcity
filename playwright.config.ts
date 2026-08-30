import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  // ── Test directory ─────────────────────────────────────────────────────────
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",

  // ── Parallelism ───────────────────────────────────────────────────────────
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // ── Reporter ──────────────────────────────────────────────────────────────
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["list"],
  ],

  // ── Shared settings ───────────────────────────────────────────────────────
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  // ── Projects (browsers) ──────────────────────────────────────────────────
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  // ── Dev server ───────────────────────────────────────────────────────────
  // Auto-starts the dev server before tests if not already running.
  // Comment this out if you prefer to run `pnpm dev` manually first.
  webServer: {
    command: "npx pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});

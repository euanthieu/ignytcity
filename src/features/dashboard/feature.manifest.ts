/**
 * FAOS v5 — Feature Manifest
 *
 * CI-ONLY: This file is never imported into the React tree.
 * It is a static declaration consumed by tools/validate-architecture.ts.
 */
export const featureManifest = {
  name: "dashboard",
  dependsOn: [] as const,
  exposes: ["StatsCard", "RevenueChart", "useDashboardStats"] as const,
} as const;

export type DashboardManifest = typeof featureManifest;

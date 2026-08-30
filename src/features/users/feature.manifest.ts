/**
 * FAOS v5 — Feature Manifest
 *
 * CI-ONLY: This file is never imported into the React tree.
 * It is a static declaration consumed by tools/validate-architecture.ts.
 */
export const featureManifest = {
  name: "users",
  dependsOn: ["auth"] as const,
  exposes: ["UserList", "useUsers"] as const,
} as const;

export type UsersManifest = typeof featureManifest;

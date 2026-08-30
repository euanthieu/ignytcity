export const featureManifest = {
  name: "auth",
  dependsOn: [] as const,
  exposes: [
    "useAuthStore",
    "SellerAuthGate",
    "AdminAuthGate",
    "AgentAuthGate",
  ] as const,
} as const;

export type AuthManifest = typeof featureManifest;

export const FLAGS = {
  NEW_DASHBOARD: "new_dashboard",
  ADVANCED_ANALYTICS: "advanced_analytics",
  BETA_EDITOR: "beta_editor",
} as const;

export type FlagKey = keyof typeof FLAGS;
export type FlagValue = (typeof FLAGS)[FlagKey];

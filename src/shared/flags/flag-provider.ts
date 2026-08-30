import { create } from "zustand";
import { FlagEngine, LocalFlagEngine } from "./engine";

type FlagState = {
  engine: FlagEngine;
  setEngine: (engine: FlagEngine) => void;
};

export const useFlagStore = create<FlagState>((set) => ({
  engine: new LocalFlagEngine({
    NEW_DASHBOARD: true,
    ADVANCED_ANALYTICS: false,
    BETA_EDITOR: true,
  }),
  setEngine: (engine) => set({ engine }),
}));

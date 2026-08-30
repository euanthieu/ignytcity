import { FlagKey } from "./flags";
import { useFlagStore } from "./flag-provider";

export function useFeatureFlag(flag: FlagKey) {
  const engine = useFlagStore((s) => s.engine);
  return engine.getFlag(flag);
}

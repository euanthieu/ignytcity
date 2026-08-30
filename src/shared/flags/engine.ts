import { FlagKey } from "./flags";

export interface FlagEngine {
  getFlag(key: FlagKey): boolean;
}

export class LocalFlagEngine implements FlagEngine {
  private store: Record<FlagKey, boolean>;

  constructor(initialStore: Record<FlagKey, boolean>) {
    this.store = initialStore;
  }

  getFlag(key: FlagKey): boolean {
    return this.store[key] ?? false;
  }
}

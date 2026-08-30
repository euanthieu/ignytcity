import { create } from "zustand";
import {
  getToken,
  getRefreshToken,
  setToken as setStorageToken,
  clearToken as clearStorageToken,
} from "@/shared/lib/token";

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  setToken: (token: string | null, refreshToken?: string | null) => void;
  clearToken: () => void;
}

import { setOnTokenRefresh, setOnTokenClear } from "@/shared/lib/http";

export const useAuthStore = create<AuthState>((set) => ({
  token: getToken(),
  refreshToken: getRefreshToken(),
  setToken: (token, refreshToken) => {
    if (token) setStorageToken(token, refreshToken || undefined);
    else clearStorageToken();
    set({ token, refreshToken: refreshToken || null });
  },
  clearToken: () => {
    clearStorageToken();
    set({ token: null, refreshToken: null });
  },
}));

setOnTokenRefresh((token, refreshToken) => {
  useAuthStore.getState().setToken(token, refreshToken);
});

setOnTokenClear(() => {
  useAuthStore.getState().clearToken();
});

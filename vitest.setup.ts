/**
 * Vitest global setup file.
 * Runs once before each test file.
 */
import "@testing-library/jest-dom";

// ── Env mocks ──────────────────────────────────────────────────────────────
// Provide required env vars for all tests so env.ts validation passes
process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001";
process.env.NEXT_PUBLIC_APP_ENV = "development";
process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";

// ── Browser API mocks ──────────────────────────────────────────────────────
// localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// matchMedia (not implemented in jsdom)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

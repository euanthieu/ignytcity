import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { useUsers } from "@/features/users/hooks/useUsers";
import * as usersClient from "@/features/users/api/users.client";

// ── Wrapper ──────────────────────────────────────────────────────────────────
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries in tests for speed
        gcTime: 0,
      },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

describe("useUsers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error state when fetch fails", async () => {
    const mockError = new Error("Failed to fetch users");
    vi.spyOn(usersClient, "getUsers").mockRejectedValue(mockError);

    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeTruthy();
  });
});

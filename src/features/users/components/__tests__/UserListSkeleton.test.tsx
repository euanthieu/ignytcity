import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { UserListSkeleton } from "@/features/users/components/UserListSkeleton";
import * as useUsersModule from "@/features/users/hooks/useUsers";

// ── Wrapper ──────────────────────────────────────────────────────────────────
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

// ── Tests ────────────────────────────────────────────────────────────────────
describe("UserListSkeleton", () => {
  it("renders 5 skeleton rows", () => {
    const { container } = render(<UserListSkeleton />);
    // Each skeleton row has a rounded-full avatar skeleton
    const avatarSkeletons = container.querySelectorAll(".rounded-full");
    expect(avatarSkeletons).toHaveLength(5);
  });

  it("renders inside a space-y-4 container", () => {
    const { container } = render(<UserListSkeleton />);
    expect(container.firstChild).toHaveClass("space-y-4");
  });
});

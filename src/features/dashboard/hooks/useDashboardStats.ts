import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getDashboardStats } from "../api/dashboard.client";
import { dashboardKeys } from "../api/dashboard.keys";

/**
 * Fetches dashboard stats (summary cards + revenue chart data).
 * Retry policy is applied automatically via useSafeQuery.
 */
export function useDashboardStats() {
  return useSafeQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: getDashboardStats,
    staleTime: 5 * 60 * 1000, // Consider stats fresh for 5 minutes
  });
}

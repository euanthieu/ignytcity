import { fetcher } from "@/shared/lib/http";
import {
  DashboardStatsSchema,
  type DashboardStats,
} from "../contracts/dashboard.contract";

/**
 * Mock data — replace with real API endpoint when backend is available.
 * Pattern: always validate through Zod even with mock data to catch schema drift early.
 */
const MOCK_DASHBOARD_STATS = {
  stats: [
    {
      id: "revenue",
      label: "Total Revenue",
      value: "$48,295",
      change: 12.5,
      trend: "up",
    },
    {
      id: "users",
      label: "Active Users",
      value: 3_842,
      change: 8.2,
      trend: "up",
    },
    {
      id: "orders",
      label: "New Orders",
      value: 1_204,
      change: -2.1,
      trend: "down",
    },
    {
      id: "conversion",
      label: "Conversion Rate",
      value: "3.6%",
      change: 0.4,
      trend: "up",
    },
  ],
  revenueChart: [
    { month: "Jan", revenue: 32000, expenses: 18000 },
    { month: "Feb", revenue: 38000, expenses: 19500 },
    { month: "Mar", revenue: 35000, expenses: 21000 },
    { month: "Apr", revenue: 41000, expenses: 20000 },
    { month: "May", revenue: 46000, expenses: 22000 },
    { month: "Jun", revenue: 48295, expenses: 21500 },
  ],
  lastUpdated: new Date().toISOString(),
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  // TODO: Replace with real API call when backend is ready:
  // const raw = await fetcher<unknown>("/api/dashboard/stats");
  // return DashboardStatsSchema.parse(raw);

  // Using mock data — still parsed through Zod for schema enforcement
  return DashboardStatsSchema.parse(MOCK_DASHBOARD_STATS);
};

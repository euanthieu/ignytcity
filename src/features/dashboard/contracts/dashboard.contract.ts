import { z } from "zod";

/**
 * FAOS v5 — Dashboard Contracts
 *
 * Authoritative shape for all dashboard API responses.
 * Types are derived from schemas — never declared separately.
 */

export const StatCardSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  change: z.number().describe("Percentage change vs. previous period"),
  trend: z.enum(["up", "down", "neutral"]),
});

export const RevenueDataPointSchema = z.object({
  month: z.string(),
  revenue: z.number(),
  expenses: z.number(),
});

export const DashboardStatsSchema = z.object({
  stats: z.array(StatCardSchema),
  revenueChart: z.array(RevenueDataPointSchema),
  lastUpdated: z.string().datetime().optional(),
});

export type StatCard = z.infer<typeof StatCardSchema>;
export type RevenueDataPoint = z.infer<typeof RevenueDataPointSchema>;
export type DashboardStats = z.infer<typeof DashboardStatsSchema>;

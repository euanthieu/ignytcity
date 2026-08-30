export interface KPIMetrics {
  revenue: number;
  activeOrders: number;
  lowStockCount: number;
  revenueGrowthPercentage: number;
  orderGrowthPercentage: number;
}

export interface ChartDataPoint {
  date: string;
  revenue: number;
  salesVelocity: number;
}

export type TimeRangeToken = "7d" | "30d" | "90d";

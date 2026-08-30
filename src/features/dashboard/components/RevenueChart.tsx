"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { RevenueDataPoint } from "../contracts/dashboard.contract";

interface RevenueChartProps {
  data: RevenueDataPoint[];
}

function formatCurrency(value: number) {
  return `$${(value / 1000).toFixed(0)}k`;
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="p-6 rounded-2xl glass-light border border-white/5">
      <div className="mb-6">
        <h3 className="text-lg font-bold">Revenue vs Expenses</h3>
        <p className="text-sm text-text-tertiary mt-1">Last 6 months</p>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart
          data={data}
          margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
          />

          <XAxis
            dataKey="month"
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatCurrency}
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            contentStyle={{
              background: "rgba(15,15,20,0.9)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              color: "#fff",
              fontSize: "13px",
            }}
            formatter={(value) => [formatCurrency(Number(value))]}
          />

          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#7c3aed"
            strokeWidth={2}
            fill="url(#revenueGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "#7c3aed" }}
          />
          <Area
            type="monotone"
            dataKey="expenses"
            name="Expenses"
            stroke="#f43f5e"
            strokeWidth={2}
            fill="url(#expensesGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "#f43f5e" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

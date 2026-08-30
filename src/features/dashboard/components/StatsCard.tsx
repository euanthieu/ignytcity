"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { StatCard } from "../contracts/dashboard.contract";

interface StatsCardProps {
  stat: StatCard;
  index: number;
}

export function StatsCard({ stat, index }: StatsCardProps) {
  const TrendIcon =
    stat.trend === "up"
      ? TrendingUp
      : stat.trend === "down"
        ? TrendingDown
        : Minus;

  const trendColor =
    stat.trend === "up"
      ? "text-emerald-400"
      : stat.trend === "down"
        ? "text-red-400"
        : "text-zinc-400";

  const trendBg =
    stat.trend === "up"
      ? "bg-emerald-400/10"
      : stat.trend === "down"
        ? "bg-red-400/10"
        : "bg-zinc-400/10";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="p-6 rounded-2xl glass-light border border-white/5 hover:border-white/10 transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-text-tertiary">{stat.label}</p>
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${trendBg} ${trendColor}`}
        >
          <TrendIcon className="w-3 h-3" />
          {Math.abs(stat.change)}%
        </span>
      </div>
      <p className="text-3xl font-black tracking-tight">{stat.value}</p>
      <p className="mt-2 text-xs text-text-quaternary">vs. previous period</p>
    </motion.div>
  );
}

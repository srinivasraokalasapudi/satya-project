import React, { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Calendar,
  CalendarDays,
  CalendarRange,
  IndianRupee,
  Receipt,
  Users,
  Clock3,
  TrendingUp,
  TrendingDown,
  RefreshCcw,
  Flame,
} from "lucide-react";

import GlassCard from "./GlassCard";
import SectionHeader from "./SectionHeader";
import StatCard from "./StatCard";
import ReportChart from "./ReportChart";
import ProgressGoal from "./ProgressGoal";
import { REPORT_FETCHERS } from "../../https/reportHttp";
import { formatCurrency, formatCompact, generateMockReport, PERIOD_META } from "./reportUtils";

const TABS = [
  { id: "live", label: "Live", icon: Activity },
  { id: "daily", label: "Daily", icon: Calendar },
  { id: "weekly", label: "Weekly", icon: CalendarDays },
  { id: "monthly", label: "Monthly", icon: CalendarRange },
];

// Resolves the real endpoint first; if it's unavailable (e.g. backend route
// not built yet) it falls back to realistic demo data so the dashboard is
// still useful to look at and demo.
const fetchReport = async (period) => {
  try {
    const res = await REPORT_FETCHERS[period]();
    return { ...res.data, period, isDemo: false };
  } catch (err) {
    return { ...generateMockReport(period), period, isDemo: true };
  }
};

const useSecondsAgo = (timestamp) => {
  const [, forceTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);
  if (!timestamp) return null;
  return Math.max(0, Math.round((Date.now() - timestamp) / 1000));
};

const ReportsSection = () => {
  const [activeTab, setActiveTab] = useState("live");
  const meta = PERIOD_META[activeTab];

  const { data, isLoading, isFetching, dataUpdatedAt, refetch } = useQuery({
    queryKey: ["report", activeTab],
    queryFn: () => fetchReport(activeTab),
    refetchInterval: activeTab === "live" ? 15000 : false,
    staleTime: activeTab === "live" ? 10000 : 60000,
  });

  const secondsAgo = useSecondsAgo(dataUpdatedAt);

  const growthPositive = (data?.growth ?? 0) >= 0;

  const statCards = useMemo(() => {
    if (!data) return [];
    const base = [
      {
        icon: IndianRupee,
        label: "Revenue",
        value: formatCurrency(data.revenue),
        accent: `${growthPositive ? "+" : ""}${data.growth ?? 0}%`,
      },
      {
        icon: Receipt,
        label: "Orders",
        value: data.orders?.toLocaleString("en-IN"),
      },
    ];

    if (activeTab === "live") {
      base.push(
        { icon: Users, label: "Active Tables", value: data.activeTables },
        { icon: Clock3, label: "Avg Prep Time", value: `${data.avgPrepTime} min` }
      );
    } else if (activeTab === "daily") {
      base.push(
        { icon: Flame, label: "Best Day", value: data.bestDay },
        {
          icon: growthPositive ? TrendingUp : TrendingDown,
          label: "Avg Order Value",
          value: formatCurrency(Math.round(data.revenue / Math.max(data.orders, 1))),
        }
      );
    } else {
      base.push(
        {
          icon: growthPositive ? TrendingUp : TrendingDown,
          label: "Growth",
          value: `${growthPositive ? "+" : ""}${data.growth}%`,
          subtitle: "vs previous period",
        },
        {
          icon: Receipt,
          label: "Avg Order Value",
          value: formatCurrency(Math.round(data.revenue / Math.max(data.orders, 1))),
        }
      );
    }
    return base;
  }, [data, activeTab, growthPositive]);

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <SectionHeader title="Reports & Progress" subtitle="Track performance across every timeframe" />

        <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-1.5 backdrop-blur-xl">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors duration-200 ${
                  active ? "text-obsidian" : "text-gray-400 hover:text-white"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="report-tab-pill"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-gold-light to-gold"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon size={14} className="relative z-10" />
                <span className="relative z-10">{tab.label}</span>
                {tab.id === "live" && (
                  <span className="relative z-10 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 px-1">
        <p className="text-gray-500 text-xs">{meta.subtitle}</p>
        <div className="flex items-center gap-3">
          {data?.isDemo && (
            <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-400/80 bg-amber-400/10 border border-amber-400/20 rounded-full px-2 py-0.5">
              Demo data
            </span>
          )}
          {secondsAgo !== null && (
            <span className="text-gray-600 text-[11px]">
              Updated {secondsAgo < 5 ? "just now" : `${secondsAgo}s ago`}
            </span>
          )}
          <button
            onClick={() => refetch()}
            className="text-gray-400 hover:text-gold transition-colors"
            title="Refresh"
            aria-label="Refresh report data"
          >
            <RefreshCcw size={14} className={isFetching ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <GlassCard key={i} className="p-5 h-32">
                  <div className="h-full w-full rounded-lg bg-white/5 animate-pulse" />
                </GlassCard>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {statCards.map((card, i) => (
                  <StatCard key={card.label} index={i} {...card} />
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <GlassCard className="p-5 md:p-6 lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-white font-semibold text-sm">{meta.chartLabel}</p>
                    <span className="text-gray-500 text-xs">Revenue (\u20b9)</span>
                  </div>
                  <ReportChart data={data.chart} valueFormatter={formatCompact} />
                </GlassCard>

                <ProgressGoal
                  label={meta.goalLabel}
                  note={`${meta.title} cumulative revenue`}
                  current={data.revenue}
                  goal={data.goal}
                  formatter={formatCurrency}
                />
              </div>

              {data.topItems?.length > 0 && (
                <GlassCard className="p-5 md:p-6 mt-4">
                  <p className="text-white font-semibold text-sm mb-4">Top Performing Items</p>
                  <div className="flex flex-col gap-3">
                    {data.topItems.map((item, i) => {
                      const max = Math.max(...data.topItems.map((t) => t.orders));
                      const pct = Math.round((item.orders / max) * 100);
                      return (
                        <div key={item.name} className="flex items-center gap-3">
                          <span className="text-gray-500 text-xs w-5 shrink-0">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="text-gray-300 text-sm w-36 shrink-0 truncate">{item.name}</span>
                          <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.6, delay: i * 0.08 }}
                              className="h-full rounded-full bg-gradient-to-r from-gold-dark to-gold-light"
                            />
                          </div>
                          <span className="text-white text-xs font-semibold w-16 text-right shrink-0">
                            {item.orders} orders
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ReportsSection;

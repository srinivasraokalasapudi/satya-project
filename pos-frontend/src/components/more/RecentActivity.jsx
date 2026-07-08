import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, PackageOpen } from "lucide-react";
import GlassCard from "./GlassCard";
import SectionHeader from "./SectionHeader";

const statusIcon = {
  "In Progress": Clock,
  Ready: PackageOpen,
  Completed: CheckCircle2,
};

const RecentActivity = ({ items = [], loading = false, isDemo = false }) => {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <SectionHeader title="Recent Activity" subtitle="Latest orders across your restaurant" />
        {isDemo && !loading && (
          <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-400/80 bg-amber-400/10 border border-amber-400/20 rounded-full px-2 py-0.5">
            Demo data
          </span>
        )}
      </div>
      <GlassCard className="p-5 md:p-6">
        {loading ? (
          <div className="flex flex-col gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-5 rounded-md bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">
            No recent orders yet today.
          </p>
        ) : (
          <div className="relative">
            <div className="absolute left-[9px] top-2 bottom-2 w-px bg-white/10" />
            <div className="flex flex-col gap-5">
              {items.map((item, i) => {
                const Icon = statusIcon[item.status] || CheckCircle2;
                return (
                  <motion.div
                    key={item.id || item.title}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.06 }}
                    className="relative flex items-start gap-4 pl-0"
                  >
                    <span className="relative z-10 shrink-0 w-[19px] h-[19px] rounded-full bg-obsidian border border-gold/40 flex items-center justify-center">
                      <Icon size={12} className="text-gold" />
                    </span>
                    <div className="flex-1 flex items-center justify-between gap-3 -mt-0.5">
                      <span className="text-white text-sm font-medium">{item.title}</span>
                      <span className="text-gray-500 text-xs whitespace-nowrap">{item.time}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default RecentActivity;

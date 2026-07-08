import React from "react";
import { motion } from "framer-motion";
import GlassCard from "./GlassCard";

const StatCard = ({ icon: Icon, label, value, subtitle, accent, index = 0, loading = false }) => {
  return (
    <GlassCard
      interactive
      className="p-5 group"
      as={motion.div}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 bg-white/5 group-hover:border-gold/50 transition-colors duration-300"
        >
          <Icon size={22} className="text-gold" />
        </div>
        {accent && (
          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2 py-0.5">
            {accent}
          </span>
        )}
      </div>

      {loading ? (
        <div className="h-8 w-20 mt-4 rounded-md bg-white/10 animate-pulse" />
      ) : (
        <p className="text-white text-2xl md:text-3xl font-bold mt-4 tracking-tight">
          {value}
        </p>
      )}
      <p className="text-gray-400 text-sm mt-1">{label}</p>
      {subtitle && <p className="text-gray-600 text-xs mt-0.5">{subtitle}</p>}
    </GlassCard>
  );
};

export default StatCard;

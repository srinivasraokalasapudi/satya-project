import React from "react";
import { motion } from "framer-motion";
import { Target, PartyPopper } from "lucide-react";
import GlassCard from "./GlassCard";

const ProgressGoal = ({
  label = "Target Progress",
  note,
  current = 0,
  goal = 1,
  formatter = (v) => v,
}) => {
  const pct = Math.min(100, Math.round((current / Math.max(goal, 1)) * 100));
  const reached = pct >= 100;

  return (
    <GlassCard className="p-5 md:p-6 h-full">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg border border-gold/30 bg-gold/10 flex items-center justify-center shrink-0">
            {reached ? (
              <PartyPopper size={16} className="text-gold" />
            ) : (
              <Target size={16} className="text-gold" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">{label}</p>
            {note && <p className="text-gray-500 text-xs truncate">{note}</p>}
          </div>
        </div>
        <span className={`font-bold text-lg shrink-0 ${reached ? "text-emerald-400" : "text-gold"}`}>
          {pct}%
        </span>
      </div>

      <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${
            reached ? "bg-emerald-400" : "bg-gradient-to-r from-gold-dark to-gold-light"
          }`}
        />
      </div>

      <div className="flex items-center justify-between mt-3 text-xs gap-2">
        <span className="text-gray-400 truncate">{formatter(current)} achieved</span>
        <span className="text-gray-500 whitespace-nowrap">Goal: {formatter(goal)}</span>
      </div>
    </GlassCard>
  );
};

export default ProgressGoal;

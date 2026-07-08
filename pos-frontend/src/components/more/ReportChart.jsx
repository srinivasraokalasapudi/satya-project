import React from "react";
import { motion } from "framer-motion";

/**
 * ReportChart
 * Lightweight animated bar chart built with plain divs (no chart library
 * dependency required). Hover a bar to see its exact value.
 */
const ReportChart = ({ data = [], height = 170, valueFormatter = (v) => v }) => {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="w-full" style={{ height }}>
      <div className="flex items-end justify-between h-full gap-1.5 md:gap-2.5">
        {data.map((d, i) => {
          const pct = Math.max(4, Math.round((d.value / max) * 100));
          return (
            <div
              key={`${d.label}-${i}`}
              className="flex-1 flex flex-col items-center justify-end h-full group"
            >
              <span className="text-[10px] font-medium text-gold/90 mb-1.5 opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all duration-200 whitespace-nowrap">
                {valueFormatter(d.value)}
              </span>
              <div className="w-full h-full rounded-t-md bg-white/[0.04] relative overflow-hidden">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${pct}%` }}
                  transition={{ duration: 0.6, delay: i * 0.035, ease: "easeOut" }}
                  className="absolute bottom-0 left-0 right-0 rounded-t-md bg-gradient-to-t from-gold-dark via-gold to-gold-light group-hover:brightness-110 transition-[filter] duration-200"
                />
              </div>
              <span className="text-[10px] text-gray-500 mt-2 whitespace-nowrap">
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReportChart;

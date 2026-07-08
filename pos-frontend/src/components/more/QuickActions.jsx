import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileBarChart,
  Printer,
  DatabaseBackup,
  RefreshCcw,
  RotateCw,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import SectionHeader from "./SectionHeader";
import { generateDailyReport, runDatabaseBackup, syncMenu } from "../../https/dashboardHttp";

const actions = [
  { id: "report", title: "Generate Daily Report", icon: FileBarChart, run: generateDailyReport },
  { id: "print", title: "Print Sales Summary", icon: Printer, run: () => Promise.resolve(window.print()) },
  { id: "backup", title: "Backup Database", icon: DatabaseBackup, run: runDatabaseBackup },
  { id: "sync", title: "Sync Menu", icon: RefreshCcw, run: syncMenu },
  {
    id: "refresh",
    title: "Refresh System",
    icon: RotateCw,
    run: () => new Promise((resolve) => setTimeout(resolve, 350)).then(() => window.location.reload()),
  },
];

const QuickActions = ({ onAction }) => {
  const [spinning, setSpinning] = useState(null);
  const [feedback, setFeedback] = useState(null); // { title, ok }

  const handleClick = async (action) => {
    if (spinning) return;
    setSpinning(action.id);
    setFeedback(null);
    onAction?.(action.title);

    try {
      await action.run();
      setFeedback({ title: action.title, ok: true });
    } catch (err) {
      setFeedback({ title: action.title, ok: false });
    } finally {
      setSpinning(null);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div>
      <SectionHeader title="Quick Actions" subtitle="One-tap tools for daily operations" />
      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        {actions.map((action, i) => {
          const Icon = action.icon;
          const isSpinning = spinning === action.id;
          return (
            <motion.button
              key={action.id}
              onClick={() => handleClick(action)}
              disabled={isSpinning}
              aria-label={action.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.96 }}
              className="flex-1 min-w-[180px] flex items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl px-5 py-4 text-sm font-semibold text-white shadow-premium hover:border-gold/50 hover:shadow-gold-glow transition-colors duration-300 disabled:opacity-60 disabled:cursor-wait"
            >
              <Icon
                size={18}
                className={`text-gold ${isSpinning ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              {action.title}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={`mt-3 flex items-center gap-2 text-xs font-medium rounded-xl px-3 py-2 border w-fit ${
              feedback.ok
                ? "text-emerald-400 border-emerald-400/20 bg-emerald-400/10"
                : "text-red-400 border-red-400/20 bg-red-400/10"
            }`}
          >
            {feedback.ok ? (
              <CheckCircle2 size={14} aria-hidden="true" />
            ) : (
              <XCircle size={14} aria-hidden="true" />
            )}
            {feedback.ok
              ? `${feedback.title} completed`
              : `${feedback.title} failed — check your connection and try again`}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuickActions;

import React from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Server,
  Printer,
  Receipt,
  Wifi,
  Database,
  CreditCard,
} from "lucide-react";
import GlassCard from "./GlassCard";
import SectionHeader from "./SectionHeader";
import { getSystemHealth } from "../../https/dashboardHttp";
import useOnlineStatus from "../../hooks/useOnlineStatus";

const HEALTH_ITEMS = [
  { key: "posServer", label: "POS Server", icon: Server },
  { key: "kitchenPrinter", label: "Kitchen Printer", icon: Printer },
  { key: "receiptPrinter", label: "Receipt Printer", icon: Receipt },
  { key: "internet", label: "Internet", icon: Wifi, useBrowserFallback: true },
  { key: "database", label: "Database", icon: Database },
  { key: "paymentGateway", label: "Payment Gateway", icon: CreditCard },
];

const STATUS_STYLES = {
  ok: { dot: "bg-emerald-400", text: "text-emerald-400", label: "Online", pulse: true },
  degraded: { dot: "bg-amber-400", text: "text-amber-400", label: "Degraded", pulse: false },
  down: { dot: "bg-red-400", text: "text-red-400", label: "Offline", pulse: false },
  unknown: { dot: "bg-gray-500", text: "text-gray-500", label: "Unknown", pulse: false },
};

const BusinessHealth = () => {
  const isBrowserOnline = useOnlineStatus();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["system-health"],
    queryFn: async () => (await getSystemHealth()).data,
    refetchInterval: 30000,
    staleTime: 20000,
    retry: 1,
  });

  const noBackend = isError || !data;

  return (
    <div>
      <SectionHeader
        title="Business Health"
        subtitle={
          noBackend
            ? "Health endpoint not reachable — showing what we can verify locally"
            : "Live status of critical restaurant systems"
        }
      />
      <GlassCard className="p-5 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {HEALTH_ITEMS.map((item, i) => {
            const Icon = item.icon;

            // Internet connectivity can be verified locally via the browser
            // even when the backend health route is unreachable.
            let rawStatus = data?.[item.key];
            if (!rawStatus && item.useBrowserFallback) {
              rawStatus = isBrowserOnline ? "ok" : "down";
            }
            const status = STATUS_STYLES[rawStatus] || STATUS_STYLES.unknown;

            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 hover:border-gold/30 transition-colors duration-300"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon size={17} className="text-gray-400 shrink-0" aria-hidden="true" />
                  <span className="text-gray-300 text-sm truncate">{item.label}</span>
                </div>

                {isLoading ? (
                  <span className="w-16 h-3 rounded-full bg-white/10 animate-pulse shrink-0" />
                ) : (
                  <span className={`flex items-center gap-1.5 text-xs font-semibold shrink-0 ${status.text}`}>
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${status.dot} ${status.pulse ? "animate-pulse" : ""}`}
                    />
                    {status.label}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
};

export default BusinessHealth;

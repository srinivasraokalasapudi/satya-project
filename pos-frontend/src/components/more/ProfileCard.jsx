import React from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { CircleCheck, CircleAlert, CircleHelp } from "lucide-react";
import logo from "../../assets/images/logo.png";
import { getSystemHealth } from "../../https/dashboardHttp";
import useOnlineStatus from "../../hooks/useOnlineStatus";

const getShift = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Morning Shift";
  if (hour >= 12 && hour < 17) return "Afternoon Shift";
  if (hour >= 17 && hour < 23) return "Evening Shift";
  return "Night Shift";
};

const ProfileCard = ({ userName, userRole }) => {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isBrowserOnline = useOnlineStatus();

  // Shares the "system-health" cache with BusinessHealth/VersionFooter.
  const { data: health } = useQuery({
    queryKey: ["system-health"],
    queryFn: async () => (await getSystemHealth()).data,
    staleTime: 20000,
    retry: 1,
  });

  const allSystemsOk =
    health && Object.values(health).every((v) => v === "ok");
  const statusMeta = !isBrowserOnline
    ? { Icon: CircleAlert, text: "Offline", color: "text-red-400" }
    : health
    ? allSystemsOk
      ? { Icon: CircleCheck, text: "System Healthy", color: "text-emerald-400" }
      : { Icon: CircleAlert, text: "Attention Needed", color: "text-amber-400" }
    : { Icon: CircleHelp, text: "Status Unknown", color: "text-gray-400" };

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative rounded-[20px] border border-gold/20 bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent backdrop-blur-xl shadow-premium p-6 md:p-8 overflow-hidden"
    >
      {/* ambient gold glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 bg-gold/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 bg-gold/5 rounded-full blur-3xl" />

      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 border-gold/40 shadow-gold-glow bg-black/40 flex items-center justify-center shrink-0">
            <img src={logo} alt="VASU 5-Star Restaurant" className="w-full h-full object-cover" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-white text-2xl md:text-3xl font-bold tracking-wide">
                VASU 5-Star Restaurant
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-full px-2.5 py-1 border ${
                  isBrowserOnline
                    ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/30"
                    : "text-red-400 bg-red-400/10 border-red-400/30"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isBrowserOnline ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                  }`}
                />
                {isBrowserOnline ? "Online" : "Offline"}
              </span>
            </div>
            <p className="text-gold/80 text-xs tracking-[0.25em] mt-1 uppercase">
              Main Branch &middot; Premium Dining
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
          <InfoStat label="Logged in as" value={userName || "Administrator"} />
          <InfoStat label="Current Shift" value={getShift()} />
          <InfoStat label="Today" value={today} small />
          <div className="flex flex-col justify-center">
            <span className="text-gray-500 text-[11px] uppercase tracking-wider mb-1">Status</span>
            <span className={`flex items-center gap-1.5 font-semibold text-sm ${statusMeta.color}`}>
              <statusMeta.Icon size={16} />
              {statusMeta.text}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const InfoStat = ({ label, value, sub, small }) => (
  <div className="flex flex-col justify-center">
    <span className="text-gray-500 text-[11px] uppercase tracking-wider mb-1">{label}</span>
    <span className={`text-white font-semibold ${small ? "text-xs md:text-sm" : "text-sm"}`}>{value}</span>
    {sub && <span className="text-gray-500 text-xs">{sub}</span>}
  </div>
);

export default ProfileCard;

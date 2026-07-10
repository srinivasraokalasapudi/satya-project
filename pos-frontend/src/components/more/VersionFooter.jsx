import React from "react";
import { useQuery } from "@tanstack/react-query";
import GlassCard from "./GlassCard";
import { getSystemHealth } from "../../https/dashboardHttp";

const APP_VERSION = "2.1.0";

const VersionFooter = () => {
  // Shares the "system-health" query cache with BusinessHealth/ProfileCard —
  // react-query dedupes identical keys, so this doesn't add an extra request.
  const { data } = useQuery({
    queryKey: ["system-health"],
    queryFn: async () => (await getSystemHealth()).data,
    staleTime: 20000,
    retry: 1,
  });

  const backendStatus = data ? "Connected" : "Unavailable";
  const dbStatus = !data
    ? "Unknown"
    : data.database === "ok"
    ? "MongoDB · Connected"
    : "MongoDB · Issue";
  const serverRegion = import.meta.env.VITE_SERVER_REGION || "Not configured";

  return (
    <GlassCard className="p-5 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-white font-semibold text-sm tracking-wide">VASU POS</p>
          <p className="text-gray-500 text-xs mt-0.5">Version {APP_VERSION}</p>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs">
          <FooterStat label="Backend" value={backendStatus} />
          <FooterStat label="Database" value={dbStatus} />
          <FooterStat label="Server" value={serverRegion} />
        </div>

        <p className="text-gray-600 text-xs">
          &copy; {new Date().getFullYear()} VASU 5-Star Restaurant
        </p>
      </div>
    </GlassCard>
  );
};

const FooterStat = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-gray-600 uppercase tracking-wider text-[10px]">{label}</span>
    <span className="text-gray-300 font-medium">{value}</span>
  </div>
);

export default VersionFooter;

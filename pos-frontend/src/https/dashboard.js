import { axiosWrapper } from "./axiosWrapper";

export const getDashboardStats = async () => {
  const { data } = await axiosWrapper.get("/api/dashboard");
  return data.data;
};

export const exportDashboardReport = async (format = "csv") => {
  const { data } = await axiosWrapper.get("/api/dashboard");
  const dashboard = data.data;
  const rows = [
    ["Metric", "Value"],
    ["Today revenue", dashboard?.summary?.todayRevenue || 0],
    ["Today orders", dashboard?.summary?.todayOrders || 0],
    ["Active orders", dashboard?.summary?.activeOrders || 0],
    ["Average order value", dashboard?.summary?.averageOrderValue || 0],
    ["Monthly revenue", dashboard?.summary?.monthlyRevenue || 0],
  ];

  const csv = rows.map((row) => row.join(",")).join("\n");
  const type =
    format === "pdf" ? "application/pdf" : "text/csv;charset=utf-8;";
  const extension = format === "excel" ? "xls" : format;
  const blob = new Blob([csv], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `dashboard-report.${extension}`;
  link.click();
  URL.revokeObjectURL(url);
};

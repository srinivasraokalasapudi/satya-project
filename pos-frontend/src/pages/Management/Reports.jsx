import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FaChartLine,
  FaMoneyBillWave,
  FaReceipt,
  FaUtensils,
  FaCreditCard,
  FaFilePdf,
  FaFileExcel,
} from "react-icons/fa";
import { getDashboardReport } from "../../https/reportHttp";
import { exportDashboardReport } from "../../https/dashboard";
import FullScreenLoader from "../../components/shared/FullScreenLoader";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const Reports = () => {
  useEffect(() => {
    document.title = "VASU POS | Reports";
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-report"],
    queryFn: async () => {
      const response = await getDashboardReport();
      return response.data;
    },
    refetchInterval: 30000,
  });

  if (isLoading) return <FullScreenLoader />;

  const summary = data?.summary || {};
  const payments = data?.payments || [];
  const foods = data?.topItems || [];

  const cards = [
    { title: "Daily Sales", value: currency.format(summary.dailySales || 0), icon: <FaChartLine /> },
    { title: "Weekly Sales", value: currency.format(summary.weeklySales || 0), icon: <FaChartLine /> },
    { title: "Monthly Sales", value: currency.format(summary.monthlySales || 0), icon: <FaChartLine /> },
    { title: "Revenue", value: currency.format(summary.revenue || 0), icon: <FaMoneyBillWave /> },
    { title: "Tax", value: currency.format(summary.tax || 0), icon: <FaReceipt /> },
    { title: "Top Selling Items", value: `${foods.length} Items`, icon: <FaUtensils /> },
    { title: "Payment Types", value: `${payments.length} Methods`, icon: <FaCreditCard /> },
  ];

  return (
    <div className="min-h-screen bg-[#1f1f1f] px-6 py-8">
      <h1 className="text-3xl font-bold text-white">Reports</h1>
      <p className="text-gray-400 mt-2">
        Sales, revenue and financial reports
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
        {cards.map((card) => (
          <div key={card.title} className="bg-[#262626] rounded-2xl p-6 border border-gray-700">
            <div className="flex justify-between items-center">
              <div className="text-yellow-400 text-3xl">{card.icon}</div>
              <div className="text-2xl font-bold text-white">{card.value}</div>
            </div>
            <h2 className="text-white text-lg font-semibold mt-5">{card.title}</h2>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-[#262626] rounded-2xl p-6 border border-gray-700">
          <h2 className="text-white text-xl font-semibold mb-4">Top Selling Items</h2>
          {foods.length ? (
            <ul className="space-y-3">
              {foods.map((item, i) => (
                <li key={i} className="flex justify-between text-gray-300">
                  <span>{item.name || item._id}</span>
                  <span>{item.totalSold || item.orders || 0}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No data available.</p>
          )}
        </div>

        <div className="bg-[#262626] rounded-2xl p-6 border border-gray-700">
          <h2 className="text-white text-xl font-semibold mb-4">Payment Types</h2>
          {payments.length ? (
            <ul className="space-y-3">
              {payments.map((item, i) => (
                <li key={i} className="flex justify-between text-gray-300">
                  <span>{item.method || item._id || "Unknown"}</span>
                  <span>{currency.format(item.total || 0)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No payment data available.</p>
          )}
        </div>
      </div>

      <div className="bg-[#262626] rounded-2xl p-6 border border-gray-700 mt-8">
        <h2 className="text-white text-xl font-semibold mb-5">Export Reports</h2>
        <div className="flex gap-4">
          <button
            onClick={() => exportDashboardReport("pdf")}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl text-white flex items-center gap-2"
          >
            <FaFilePdf /> Download PDF
          </button>
          <button
            onClick={() => exportDashboardReport("excel")}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl text-white flex items-center gap-2"
          >
            <FaFileExcel /> Download Excel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;

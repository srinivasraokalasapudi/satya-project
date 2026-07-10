import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { io } from "socket.io-client";

import Metrics from "../components/dashboard/Metrics";
import RecentOrders from "../components/dashboard/RecentOrders";
import FullScreenLoader from "../components/shared/FullScreenLoader";
import StaffManagement from "./Management/StaffManagement";

import { getDashboardStats } from "../https/dashboard";

const tabs = ["Metrics", "Orders", "Payments", "Staff"];

const Dashboard = () => {
  useEffect(() => {
    document.title = "Satya POS | Dashboard";
  }, []);

  const [activeTab, setActiveTab] = useState("Metrics");
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardStats,
    refetchInterval: 30000,
  });

  useEffect(() => {
    const socket = io(import.meta.env.VITE_BACKEND_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => setRealtimeConnected(true));
    socket.on("disconnect", () => setRealtimeConnected(false));
    socket.on("dashboard:update", () => refetch());

    return () => {
      socket.disconnect();
    };
  }, [refetch]);

  if (isLoading) return <FullScreenLoader />;

  return (
    <div className="bg-[#1f1f1f] min-h-[calc(100vh-5rem)]">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 mt-2">
              Monitor your hotel's sales, revenue and business performance.
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-yellow-400 text-black"
                    : "bg-[#262626] text-white hover:bg-[#303030]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === "Metrics" && (
        <Metrics
          summary={data?.summary}
          weeklyRevenue={data?.weeklyRevenue}
          topSellingFoods={data?.topSellingFoods}
          paymentMethods={data?.paymentMethods}
          recentOrders={data?.recentOrders}
          waiterPerformance={data?.waiterPerformance}
          kitchenAnalytics={data?.kitchenAnalytics}
          topCustomers={data?.topCustomers}
          customerStats={{
            vip: data?.summary?.vipCustomers,
            regular: data?.summary?.regularCustomers,
          }}
          refresh={refetch}
          realtimeConnected={realtimeConnected}
        />
      )}

      {activeTab === "Orders" && (
        <RecentOrders
          recentOrders={data?.recentOrders}
          refresh={refetch}
        />
      )}

      {activeTab === "Payments" && (
        <div className="container mx-auto px-4 sm:px-6 pb-8">
          <div className="bg-[#262626] rounded-2xl p-4 sm:p-6 border border-gray-700">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-6">
              Recent Transactions
            </h2>

            {data?.recentTransactions?.length ? (
              <>
                {/* Mobile: stacked cards */}
                <div className="flex flex-col gap-3 sm:hidden">
                  {data.recentTransactions.map((payment) => (
                    <div
                      key={payment._id}
                      className="bg-[#1f1f1f] rounded-xl p-4 border border-gray-800"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-yellow-400 font-semibold text-lg">
                          ₹{payment.amount}
                        </span>
                        <span className="text-green-400 text-sm font-medium">
                          {payment.status}
                        </span>
                      </div>
                      <div
                        className="text-white text-sm truncate"
                        title={payment.paymentId}
                      >
                        {payment.paymentId}
                      </div>
                      <div className="text-gray-400 text-sm mt-1">
                        {payment.method}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tablet/Desktop: table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-700">
                        <th className="text-left py-3">Payment ID</th>
                        <th className="text-left">Amount</th>
                        <th className="text-left">Method</th>
                        <th className="text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentTransactions.map((payment) => (
                        <tr key={payment._id} className="border-b border-gray-800">
                          <td
                            className="py-4 text-white max-w-[180px] truncate"
                            title={payment.paymentId}
                          >
                            {payment.paymentId}
                          </td>
                          <td className="text-yellow-400 whitespace-nowrap">
                            ₹{payment.amount}
                          </td>
                          <td className="text-gray-300 whitespace-nowrap">
                            {payment.method}
                          </td>
                          <td className="text-green-400 whitespace-nowrap">
                            {payment.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-gray-400">
                No payment history available.
              </div>
            )}
          </div>
        </div>
      )}
      {activeTab === "Staff" && <StaffManagement />}
    </div>
  );
};

export default Dashboard;

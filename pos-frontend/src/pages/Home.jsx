import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { BsCashCoin } from "react-icons/bs";
import { GrInProgress } from "react-icons/gr";

import BottomNav from "../components/shared/BottomNav";
import Greetings from "../components/home/Greetings";
import MiniCard from "../components/home/MiniCard";
import RecentOrders from "../components/home/RecentOrders";
import PopularDishes from "../components/home/PopularDishes";

import { getDashboardStats } from "../https";

const Home = () => {
  const orders = useSelector((state) => state.orders || []);

  const [dashboard, setDashboard] = useState({
    totalEarnings: 0,
    activeOrders: 0,
    totalOrders: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getDashboardStats();

      console.log("Dashboard API Response:", response);

      const apiData =
        response?.data?.data ??
        response?.data ??
        {};

      setDashboard({
        totalEarnings: Number(apiData.totalEarnings ?? 0),
        activeOrders: Number(apiData.activeOrders ?? orders.length),
        totalOrders: Number(apiData.totalOrders ?? 0),
      });
    } catch (err) {
      console.error("Dashboard Error:", err);

      setError("Unable to load dashboard statistics.");

      setDashboard({
        totalEarnings: 0,
        activeOrders: orders.length,
        totalOrders: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [orders.length]);

  useEffect(() => {
    document.title = "POS | Home";
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <section className="bg-[#1f1f1f] min-h-[calc(100vh-5rem)] flex flex-col md:flex-row md:h-[calc(100vh-5rem)] md:overflow-hidden relative">

      <div className="flex-1 md:flex-[3] flex flex-col md:overflow-hidden">

        <Greetings />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 px-4 sm:px-8 mt-8">

          <MiniCard
            title="Total Earnings"
            icon={<BsCashCoin />}
            number={
              loading
                ? "Loading..."
                : `₹${dashboard.totalEarnings.toFixed(2)}`
            }
            footerNum={dashboard.totalOrders}
          />

          <MiniCard
            title="Orders In Progress"
            icon={<GrInProgress />}
            number={
              loading
                ? "Loading..."
                : dashboard.activeOrders
            }
            footerNum={dashboard.totalOrders}
          />

        </div>

        {error && (
          <div className="mx-4 sm:mx-8 mt-4 rounded-lg bg-red-600/20 border border-red-500 text-red-300 px-4 py-3">
            {error}
          </div>
        )}

        <div className="flex-1 md:overflow-hidden px-4 sm:px-8 mt-6 pb-24">
          <RecentOrders />
        </div>

      </div>

      <div className="flex-1 md:flex-[2] flex flex-col md:overflow-hidden px-4 sm:pr-8 sm:pl-0 pt-2 md:pt-6 pb-24">
        <PopularDishes />
      </div>

      <BottomNav />

    </section>
  );
};

export default Home;
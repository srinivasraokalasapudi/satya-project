import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getOrders, getTables } from "../https";

const isToday = (dateString) => {
  const d = new Date(dateString);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};

const timeAgo = (dateString) => {
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  );

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
};

const statusLabel = {
  "In Progress": "placed",
  Ready: "ready to serve",
  Completed: "completed & paid",
};

/**
 * Derives live Business Overview / Kitchen / Notifications / Recent Activity
 * data for the More dashboard from the same order & table endpoints already
 * used by the Orders and Tables pages (same query keys, so results are
 * shared/cached rather than re-fetched).
 */
const useOrdersOverview = () => {
  const ordersQuery = useQuery({
    queryKey: ["orders"],
    queryFn: async () => await getOrders(),
    refetchInterval: 30000,
  });

  const tablesQuery = useQuery({
    queryKey: ["tables"],
    queryFn: async () => await getTables(),
    refetchInterval: 30000,
  });

  const orders = ordersQuery.data?.data?.data || [];
  const tables = tablesQuery.data?.data?.data || [];

  const overview = useMemo(() => {
    const todaysOrders = orders.filter((o) => isToday(o.orderDate));
    const revenueToday = todaysOrders.reduce(
      (sum, o) => sum + (o.bills?.totalWithTax || 0),
      0
    );
    const kitchenActive = orders.filter(
      (o) => o.orderStatus === "In Progress"
    ).length;
    const readyToServe = orders.filter(
      (o) => o.orderStatus === "Ready"
    ).length;
    const occupiedTables = tables.filter((t) => t.status === "Booked").length;

    const recentActivity = [...orders]
      .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
      .slice(0, 5)
      .map((o) => ({
        id: o._id,
        title: `Order #${String(o._id || "").slice(-4).toUpperCase()} ${
          statusLabel[o.orderStatus] || o.orderStatus?.toLowerCase() || "updated"
        }`,
        time: timeAgo(o.orderDate),
        status: o.orderStatus,
      }));

    return {
      todaysOrdersCount: todaysOrders.length,
      revenueToday,
      kitchenActive,
      readyToServe,
      occupiedTables,
      totalTables: tables.length,
      recentActivity,
    };
  }, [orders, tables]);

  return {
    ...overview,
    isLoading: ordersQuery.isLoading || tablesQuery.isLoading,
    isError: ordersQuery.isError || tablesQuery.isError,
  };
};

export default useOrdersOverview;

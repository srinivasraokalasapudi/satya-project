import React, { useState, useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import OrderCard from "../components/orders/OrderCard";
import BackButton from "../components/shared/BackButton";
import { OrderCardSkeleton } from "../components/shared/Skeleton";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getOrders } from "../https";
import { enqueueSnackbar } from "notistack";

const Orders = () => {
  const [status, setStatus] = useState("all");

  useEffect(() => {
    document.title = "POS | Orders";
  }, []);

  const {
    data: resData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => await getOrders(),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (isError) {
      enqueueSnackbar("Something went wrong!", {
        variant: "error",
      });
    }
  }, [isError]);

  const orders = resData?.data?.data || [];

  const filteredOrders =
    status === "all"
      ? orders.filter((order) => order.orderStatus !== "Completed")
        : orders.filter((order) => {
          if (status === "progress")
            return order.orderStatus === "In Progress";

          if (status === "ready")
            return order.orderStatus === "Ready";

          if (status === "completed")
            return order.orderStatus === "Completed";

          return true;
        });

  return (
    <section className="bg-[#1f1f1f] min-h-[calc(100vh-5rem)] lg:h-[calc(100vh-5rem)] lg:overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-10 py-4 sm:py-5">
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <BackButton />
          <h1 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold tracking-wide">
            Orders
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto scrollbar-hide flex-nowrap">
          <button
            onClick={() => setStatus("all")}
            className={`shrink-0 whitespace-nowrap px-3 sm:px-5 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg font-semibold transition ${
              status === "all"
                ? "bg-[#383838] text-white"
                : "text-[#ababab] hover:text-white"
            }`}
          >
            All
          </button>

          <button
            onClick={() => setStatus("progress")}
            className={`shrink-0 whitespace-nowrap px-3 sm:px-5 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg font-semibold transition ${
              status === "progress"
                ? "bg-[#383838] text-white"
                : "text-[#ababab] hover:text-white"
            }`}
          >
            In Progress
          </button>

          <button
            onClick={() => setStatus("ready")}
            className={`shrink-0 whitespace-nowrap px-3 sm:px-5 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg font-semibold transition ${
              status === "ready"
                ? "bg-[#383838] text-white"
                : "text-[#ababab] hover:text-white"
            }`}
          >
            Ready
          </button>

          <button
            onClick={() => setStatus("completed")}
            className={`shrink-0 whitespace-nowrap px-3 sm:px-5 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg font-semibold transition ${
              status === "completed"
                ? "bg-[#383838] text-white"
                : "text-[#ababab] hover:text-white"
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Orders */}
      <div className="lg:h-[calc(100vh-220px)] lg:overflow-y-auto px-4 sm:px-6 lg:px-10 pb-32 lg:pb-40 scrollbar-hide">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-start">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <OrderCardSkeleton key={i} />)
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))
          ) : (
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex justify-center mt-20">
              <p className="text-gray-500 text-xl">
                No orders available
              </p>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </section>
  );
};

export default Orders;
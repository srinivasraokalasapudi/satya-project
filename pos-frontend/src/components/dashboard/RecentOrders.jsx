import React from "react";
import { FaSearch } from "react-icons/fa";
import OrderList from "./OrderList";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getOrders } from "../../https";

const RecentOrders = () => {
  const { data: resData, isError } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      return await getOrders();
    },
    placeholderData: keepPreviousData,
  });

  if (isError) {
    enqueueSnackbar("Something went wrong!", {
      variant: "error",
    });
  }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-[#1a1a1a] rounded-lg h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#2d2d2d]">
          <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide">
            Recent Orders
          </h1>

          <button className="text-[#025cca] text-sm font-semibold hover:text-blue-400">
            View all
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-4 bg-[#1f1f1f] rounded-xl px-5 py-4">
            <FaSearch className="text-[#f5f5f5]" />

            <input
              type="text"
              placeholder="Search recent orders"
              className="bg-transparent outline-none text-[#f5f5f5] w-full"
            />
          </div>
        </div>

        {/* Orders */}
        <div className="flex-1 overflow-y-auto px-6 py-4 pb-24 scrollbar-hide">
          {resData?.data.data.length > 0 ? (
            resData.data.data.map((order) => (
              <OrderList
                key={order._id}
                order={order}
              />
            ))
          ) : (
            <p className="text-gray-500">
              No orders available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentOrders;
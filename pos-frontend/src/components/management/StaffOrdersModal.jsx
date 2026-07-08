import React from "react";
import { useQuery } from "@tanstack/react-query";
import Modal from "../shared/Modal";
import { getStaffOrders } from "../../https";
import { formatDateAndTime } from "../../utils";

const StaffOrdersModal = ({ isOpen, onClose, staffId, staffName }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["staff-orders", staffId],
    queryFn: async () => await getStaffOrders(staffId),
    enabled: isOpen && !!staffId,
  });

  const orders = data?.data?.data?.orders || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${staffName || "Staff"} — Completed Orders`}
    >
      {isLoading && (
        <p className="text-gray-400 text-sm">Loading orders...</p>
      )}

      {isError && (
        <p className="text-red-400 text-sm">
          Couldn't load orders for this staff member.
        </p>
      )}

      {!isLoading && !isError && orders.length === 0 && (
        <p className="text-gray-400 text-sm">
          No completed orders yet.
        </p>
      )}

      {!isLoading && orders.length > 0 && (
        <div className="max-h-96 overflow-y-auto space-y-3">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-[#262626] rounded-lg px-4 py-3 flex justify-between items-center"
            >
              <div className="min-w-0">
                <p className="text-white font-medium truncate">
                  {order.customerDetails?.name || "Guest"}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {formatDateAndTime(order.orderDate)}
                </p>
              </div>

              <p className="text-[#f6b100] font-semibold shrink-0 ml-3">
                ₹{order.bills?.totalWithTax?.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default StaffOrdersModal;

import React from "react";
import { FaCheckDouble, FaLongArrowAltRight, FaCircle } from "react-icons/fa";
import { getAvatarName } from "../../utils";

const OrderList = ({ order }) => {
  return (
    <div className="flex items-center justify-between bg-[#1f1f1f] rounded-xl px-4 py-3 mb-3">
      {/* Left */}
      <div className="flex items-center gap-3">
        <div className="bg-[#f6b100] w-11 h-11 rounded-lg flex items-center justify-center text-black font-bold">
          {getAvatarName(order.customerDetails.name)}
        </div>

        <div>
          <h2 className="text-white font-semibold text-base">
            {order.customerDetails.name}
          </h2>

          <p className="text-[#ababab] text-sm">
            {order.items.length} Items
          </p>
        </div>
      </div>

      {/* Center */}
      <div className="text-[#f6b100] border border-[#f6b100] rounded-lg px-3 py-1 text-sm font-medium whitespace-nowrap">
        Table <FaLongArrowAltRight className="inline mx-1 text-[#ababab]" />
        {order.table.tableNo}
      </div>

      {/* Right */}
      {order.orderStatus === "Ready" ? (
        <div className="bg-[#2e4a40] text-green-500 px-3 py-1 rounded-lg text-sm whitespace-nowrap">
          <FaCheckDouble className="inline mr-1" />
          Ready
        </div>
      ) : (
        <div className="bg-[#4a452e] text-yellow-500 px-3 py-1 rounded-lg text-sm whitespace-nowrap">
          <FaCircle className="inline mr-1 text-[10px]" />
          {order.orderStatus}
        </div>
      )}
    </div>
  );
};

export default OrderList;
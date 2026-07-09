import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";

const OrderConfirmation = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { tableId } = useParams();

  const order = state?.order;

  return (
    <div className="min-h-screen bg-[#1f1f1f] flex flex-col items-center justify-center px-6 text-center">
      <FaCheckCircle className="text-green-500 text-6xl mb-6" />

      <h1 className="text-[#f5f5f5] text-2xl font-bold mb-2">
        Order Placed!
      </h1>

      <p className="text-[#ababab] mb-6">
        The kitchen has your order and it's being prepared. A staff member
        will bring it to your table shortly.
      </p>

      {order?.bills?.totalWithTax != null && (
        <p className="text-[#f6b100] text-xl font-bold mb-8">
          Total: ₹{Number(order.bills.totalWithTax).toFixed(2)}
        </p>
      )}

      <button
        onClick={() => navigate(`/order/${tableId}`)}
        className="bg-[#f6b100] text-black font-bold rounded-lg px-6 py-3"
      >
        Order More
      </button>
    </div>
  );
};

export default OrderConfirmation;

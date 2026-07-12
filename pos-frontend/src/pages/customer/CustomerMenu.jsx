import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import MenuContainer from "../../components/menu/MenuContainer";
import RecommendedForYou from "../../components/menu/RecommendedForYou";
import CartInfo from "../../components/menu/CartInfo";
import { getTotalPrice, removeAllItems } from "../../redux/slices/cartSlice";
import { removeDiner } from "../../redux/slices/dinerSlice";
import { addSelfOrder, logoutCustomerSelf } from "../../https";

const CustomerMenu = ({ tableId, tableNo }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const diner = useSelector((state) => state.diner);
  const cartData = useSelector((state) => state.cart);
  const total = useSelector(getTotalPrice);

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const taxRate = 5.25;
  const tax = (total * taxRate) / 100;
  const totalWithTax = total + tax;

  const handleLogout = async () => {
    try {
      await logoutCustomerSelf();
    } catch (error) {
      // ignore - clearing local state regardless
    }
    localStorage.removeItem("customerAccessToken");
    dispatch(removeDiner());
  };

  const handlePlaceOrder = async () => {
    if (cartData.length === 0) {
      enqueueSnackbar("Your cart is empty!", { variant: "warning" });
      return;
    }

    setIsPlacingOrder(true);

    try {
      const { data } = await addSelfOrder({
        bills: { total, tax, totalWithTax },
        items: cartData,
        table: tableId,
        paymentMethod: "Pay at Table",
      });

      dispatch(removeAllItems());

      enqueueSnackbar("Order placed! Your food is on its way.", {
        variant: "success",
      });

      navigate(`/order/${tableId}/confirmation`, {
        state: { order: data.data },
      });
    } catch (error) {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to place order.",
        { variant: "error" }
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="bg-[#1f1f1f] min-h-screen flex flex-col lg:flex-row">
      {/* Menu */}
      <div className="w-full lg:flex-[3] flex flex-col min-h-0">
        <div className="flex items-center justify-between flex-wrap gap-3 px-4 sm:px-6 py-4">
          <div>
            <h1 className="text-[#f5f5f5] text-xl sm:text-2xl font-bold tracking-wider">
              Table {tableNo}
            </h1>
            <p className="text-[#ababab] text-sm">Hi, {diner.name}</p>
          </div>

          <button
            onClick={handleLogout}
            className="text-[#ababab] text-sm underline"
          >
            Not you? Log out
          </button>
        </div>

        <RecommendedForYou />

        <div className="pb-4">
          <MenuContainer />
        </div>
      </div>

      {/* Cart / Bill */}
      <div className="w-full lg:flex-[1] p-4 pb-8 lg:min-h-0">
        <div className="bg-[#1a1a1a] rounded-lg flex flex-col">
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <CartInfo />
          </div>

          <hr className="border-[#2a2a2a]" />

          <div className="px-5 py-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-[#ababab]">Items ({cartData.length})</span>
              <span className="text-white font-semibold">₹{total.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-[#ababab]">Tax (5.25%)</span>
              <span className="text-white font-semibold">₹{tax.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-lg font-bold">
              <span className="text-white">Total</span>
              <span className="text-[#f6b100]">₹{totalWithTax.toFixed(2)}</span>
            </div>

            <p className="text-[#ababab] text-xs">
              Pay at table when your order is served.
            </p>

            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
              className="w-full bg-[#f6b100] text-black rounded-lg py-3 font-bold mt-2"
            >
              {isPlacingOrder ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerMenu;

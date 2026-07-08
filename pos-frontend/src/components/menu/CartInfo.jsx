import React, { useEffect, useRef } from "react";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { FaNotesMedical } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { removeItem } from "../../redux/slices/cartSlice";

const CartInfo = () => {
  const cartData = useSelector((state) => state.cart);
  const scrollRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [cartData]);

  const handleRemove = (itemId) => {
    dispatch(removeItem(itemId));
  };

  return (
    <div className="px-4 py-2">
      {/* Heading */}
      <h1 className="text-lg text-[#e4e4e4] font-semibold tracking-wide">
        Order Details
      </h1>

      {/* Cart Items */}
      <div
        ref={scrollRef}
        className="mt-4 flex-1 overflow-y-auto scrollbar-hide"
      >
        {cartData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#ababab] text-sm text-center">
              Your cart is empty. Start adding items!
            </p>
          </div>
        ) : (
          cartData.map((item) => (
            <div
              key={item.id}
              className="bg-[#1f1f1f] rounded-lg px-4 py-4 mb-3"
            >
              {/* Name & Quantity */}
              <div className="flex items-center justify-between">
                <h2 className="text-[#f5f5f5] font-semibold text-md">
                  {item.name}
                </h2>

                <span className="text-[#ababab] font-semibold">
                  x{item.quantity}
                </span>
              </div>

              {/* Price & Actions */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-4">
                  <RiDeleteBin2Fill
                    size={20}
                    onClick={() => handleRemove(item.id)}
                    className="text-red-500 cursor-pointer hover:text-red-400 transition"
                  />

                  <FaNotesMedical
                    size={18}
                    className="text-[#ababab] cursor-pointer hover:text-white transition"
                  />
                </div>

                <p className="text-white font-bold text-lg">
                  ₹{item.price}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CartInfo;
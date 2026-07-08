import React from "react";
import { popularDishes } from "../../constants";

const PopularDishes = () => {
  return (
    <div className="mt-6 pr-6 h-full">
      <div className="bg-[#1a1a1a] rounded-lg h-full flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#2d2d2d]">
          <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide">
            Popular Dishes
          </h1>
          <button className="text-[#025cca] text-sm font-semibold hover:text-blue-400">
            View all
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4 space-y-4">
          {popularDishes.map((dish, index) => (
            <div
              key={dish.id || dish._id || dish.name || index}
              className="flex items-center gap-4 bg-[#1f1f1f] rounded-xl px-5 py-4"
            >
              <h1 className="text-[#f5f5f5] font-bold text-xl w-10">
                {String(index + 1).padStart(2, "0")}
              </h1>

              <img
                src={dish.image}
                alt={dish.name}
                loading="lazy"
                decoding="async"
                className="w-14 h-14 rounded-full object-cover"
              />

              <div>
                <h1 className="text-[#f5f5f5] font-semibold">{dish.name}</h1>

                <p className="text-sm mt-1">
                  <span className="text-[#ababab]">Orders:</span>{" "}
                  <span className="text-white">{dish.numberOfOrders}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopularDishes;

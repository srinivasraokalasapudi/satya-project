import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa";
import { allFoods } from "../../constants";
import { addItems } from "../../redux/slices/cartSlice";
import { getRecommendations } from "../../https";

// Small badge copy per recommendation source, matched to what the
// backend sends back in `reason`. Falls back to the raw reason text
// for anything unexpected so this never silently hides a card.
const REASON_STYLE = {
  "Pairs well with your order": "bg-[#3b2f14] text-[#f6b100]",
  "One of your favorites": "bg-[#2e4a40] text-green-400",
  "Trending now": "bg-[#3a2440] text-[#c084fc]",
};

const RecommendedForYou = () => {
  const dispatch = useDispatch();
  const cartData = useSelector((state) => state.cart);

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Only re-fetch when the *set* of cart item names actually changes,
  // not on every quantity tweak.
  const cartNames = useMemo(
    () => [...new Set(cartData.map((item) => item.name))].sort(),
    [cartData]
  );
  const cartKey = cartNames.join("|");

  useEffect(() => {
    let cancelled = false;

    // Debounced so rapid add/remove clicks don't fire a request per click.
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await getRecommendations(cartNames);
        if (!cancelled) setRecommendations(data?.data || []);
      } catch (error) {
        // Recommendations are a nice-to-have, not core ordering flow -
        // fail quietly and just show nothing rather than an error toast.
        if (!cancelled) setRecommendations([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartKey]);

  const cards = useMemo(() => {
    return recommendations
      .map((rec) => {
        const dish = allFoods.find(
          (food) => food.name.toLowerCase() === rec.name.toLowerCase()
        );
        if (!dish) return null;
        return { ...dish, reason: rec.reason };
      })
      .filter(Boolean);
  }, [recommendations]);

  const handleAdd = (dish) => {
    dispatch(
      addItems({
        id: Date.now(),
        name: dish.name,
        quantity: 1,
        pricePerQuantity: dish.price,
        price: dish.price,
      })
    );
  };

  if (!loading && cards.length === 0) return null;

  return (
    <div className="px-4 sm:px-6 lg:px-10 pt-4">
      <div className="flex items-center gap-2 mb-3">
        <FaWandMagicSparkles className="text-[#f6b100]" />
        <h2 className="text-white font-semibold text-sm sm:text-base">
          Recommended for you
        </h2>
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {loading && cards.length === 0
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 w-36 sm:w-40 h-48 rounded-lg bg-[#1a1a1a] animate-pulse"
              />
            ))
          : cards.map((dish) => (
              <div
                key={dish.id}
                className="shrink-0 w-36 sm:w-40 bg-[#1a1a1a] hover:bg-[#262626] rounded-lg p-3"
              >
                <img
                  src={dish.image}
                  alt={dish.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-24 object-cover rounded-lg mb-2"
                />

                <span
                  className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mb-1 ${
                    REASON_STYLE[dish.reason] || "bg-[#262626] text-[#ababab]"
                  }`}
                >
                  {dish.reason}
                </span>

                <h3 className="text-white text-xs font-semibold leading-tight line-clamp-2 min-h-[2rem]">
                  {dish.name}
                </h3>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-white text-sm font-bold">
                    ₹{dish.price}
                  </span>
                  <button
                    onClick={() => handleAdd(dish)}
                    className="bg-[#2e4a40] p-1.5 rounded-lg"
                    aria-label={`Add ${dish.name} to cart`}
                  >
                    <FaPlus className="text-green-500 text-xs" />
                  </button>
                </div>
              </div>
            ))}
      </div>

      <hr className="border-[#2a2a2a] border-t-2 mt-4" />
    </div>
  );
};

export default RecommendedForYou;

import React, { useState } from "react";
import { menus } from "../../constants";
import { GrRadialSelected } from "react-icons/gr";
import { FaShoppingCart } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { addItems } from "../../redux/slices/cartSlice";

const MenuContainer = () => {
  const [selected, setSelected] = useState(menus[0]);
  const [itemCounts, setItemCounts] = useState({});

  const dispatch = useDispatch();

  const increment = (id) => {
    setItemCounts((prev) => ({
      ...prev,
      [id]: Math.min((prev[id] || 0) + 1, 10),
    }));
  };

  const decrement = (id) => {
    setItemCounts((prev) => ({
      ...prev,
      [id]: Math.max((prev[id] || 0) - 1, 0),
    }));
  };

  const handleAddToCart = (item) => {
    const quantity = itemCounts[item.id] || 0;

    if (quantity === 0) return;

    dispatch(
      addItems({
        id: Date.now(),
        name: item.name,
        quantity,
        pricePerQuantity: item.price,
        price: item.price * quantity,
      })
    );

    setItemCounts((prev) => ({
      ...prev,
      [item.id]: 0,
    }));
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 px-4 sm:px-6 lg:px-10 py-4">
        {menus.map((menu) => (
          <div
            key={menu.id}
            onClick={() => setSelected(menu)}
            className="flex flex-col justify-between gap-2 p-3 sm:p-4 rounded-lg min-h-[90px] sm:min-h-[100px] cursor-pointer"
            style={{ backgroundColor: menu.bgColor }}
          >
            <div className="flex justify-between items-start gap-2">
              <h1 className="text-white text-sm sm:text-lg font-semibold leading-tight break-words">
                {menu.icon} {menu.name}
              </h1>

              {selected.id === menu.id && (
                <GrRadialSelected className="text-white shrink-0 mt-1" />
              )}
            </div>

            <p className="text-gray-300 text-xs sm:text-base">
              {menu.items.length} Items
            </p>
          </div>
        ))}
      </div>

      <hr className="border-[#2a2a2a] border-t-2 mt-4" />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 px-4 sm:px-6 lg:px-10 py-4 pb-24">
        {selected.items.map((item) => (
          <div
            key={item.id}
            className="bg-[#1a1a1a] hover:bg-[#262626] rounded-lg p-4"
          >
          {/* Food Image */}
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            decoding="async"
            className="w-full h-36 object-cover rounded-lg mb-3"
          />

          {/* Food Name + Cart */}
          <div className="flex justify-between items-center">
            <h2 className="text-white font-semibold">
              {item.name}
            </h2>

            <button
              onClick={() => handleAddToCart(item)}
              className="bg-[#2e4a40] p-2 rounded-lg"
              aria-label={`Add ${item.name} to cart`}
            >
              <FaShoppingCart className="text-green-500" />
            </button>
          </div>

          {/* Price + Quantity */}
          <div className="mt-6 flex justify-between items-center">
            <h2 className="text-white text-2xl font-bold">
              ₹{item.price}
            </h2>

            <div className="bg-[#1f1f1f] rounded-lg flex items-center gap-6 px-4 py-2">
              <button
                onClick={() => decrement(item.id)}
                className="text-yellow-500 text-2xl"
                aria-label={`Decrease ${item.name} quantity`}
              >
                −
              </button>

              <span className="text-white" aria-live="polite">
                {itemCounts[item.id] || 0}
              </span>

              <button
                onClick={() => increment(item.id)}
                className="text-yellow-500 text-2xl"
                aria-label={`Increase ${item.name} quantity`}
              >
                +
              </button>
            </div>
          </div>
        </div>
        ))}
      </div>
    </>
  );
};

export default MenuContainer;
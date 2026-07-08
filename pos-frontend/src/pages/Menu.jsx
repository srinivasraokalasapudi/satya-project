import React, { useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import { MdRestaurantMenu } from "react-icons/md";
import MenuContainer from "../components/menu/MenuContainer";
import CustomerInfo from "../components/menu/CustomerInfo";
import CartInfo from "../components/menu/CartInfo";
import Bill from "../components/menu/Bill";
import { useSelector } from "react-redux";

const Menu = () => {
  useEffect(() => {
    document.title = "POS | Menu";
  }, []);

  const customerData = useSelector((state) => state.customer);

  return (
    <section className="bg-[#1f1f1f] min-h-[calc(100vh-5rem)] lg:h-[calc(100vh-5rem)] flex flex-col lg:flex-row lg:overflow-hidden">
      {/* Left Side */}
      <div className="w-full lg:flex-[3] flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 px-4 sm:px-6 lg:px-10 py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <BackButton />
            <h1 className="text-[#f5f5f5] text-xl sm:text-2xl font-bold tracking-wider">
              Menu
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <MdRestaurantMenu className="text-[#f5f5f5] text-3xl sm:text-4xl" />

            <div>
              <h1 className="text-white font-semibold text-sm sm:text-base">
                {customerData.customerName || "Customer Name"}
              </h1>

              <p className="text-[#ababab] text-xs sm:text-sm">
                Table : {customerData.table?.tableNo || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Menu */}
        <div className="lg:flex-1 lg:overflow-y-auto pb-4 lg:pb-24 scrollbar-hide">
          <MenuContainer />
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:flex-[1] p-4 pb-24 lg:min-h-0">
        <div className="bg-[#1a1a1a] rounded-lg lg:h-full flex flex-col lg:overflow-hidden">
          <CustomerInfo />

          <hr className="border-[#2a2a2a]" />

          <div className="lg:flex-1 lg:overflow-y-auto scrollbar-hide">
            <CartInfo />
          </div>

          <hr className="border-[#2a2a2a]" />

          <Bill />
        </div>
      </div>

      <BottomNav />
    </section>
  );
};

export default Menu;
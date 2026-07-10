import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaUsers, FaCrown, FaClipboardList, FaMoneyBillWave, FaSearch } from "react-icons/fa";

import { getCustomers } from "../../https";
import FullScreenLoader from "../../components/shared/FullScreenLoader";
import CustomerTable from "../../components/management/CustomerTable";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

// Customer database for the admin dashboard. There's nothing to add,
// edit, or delete here by hand - every row is created and kept up to
// date automatically:
//   - a customer is created the moment someone signs up on the
//     self-service ordering home page (registerCustomer)
//   - their totalOrders / totalSpent / loyaltyPoints / VIP status
//     update themselves whenever one of their orders is completed
//     (updateCustomerStats in orderController.js)
const CustomerManagement = () => {
  useEffect(() => {
    document.title = "VASU POS | Customers";
  }, []);

  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await getCustomers();
      return response.data;
    },
    refetchInterval: 30000,
  });

  const customers = data?.data || [];

  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const vipCustomers = customers.filter((c) => c.status === "VIP").length;
    const totalOrders = customers.reduce((sum, c) => sum + (c.totalOrders || 0), 0);
    const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);

    return { totalCustomers, vipCustomers, totalOrders, totalRevenue };
  }, [customers]);

  if (isLoading) return <FullScreenLoader />;

  const cards = [
    { title: "Total Customers", value: stats.totalCustomers, icon: <FaUsers /> },
    { title: "VIP Customers", value: stats.vipCustomers, icon: <FaCrown /> },
    { title: "Orders Placed", value: stats.totalOrders, icon: <FaClipboardList /> },
    {
      title: "Total Revenue",
      value: currency.format(stats.totalRevenue),
      icon: <FaMoneyBillWave />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#1f1f1f] px-6 py-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Customers</h1>
          <p className="text-gray-400 mt-2">
            Customer database and loyalty management - fills in automatically
            as diners sign up and order.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, phone or email"
            className="w-full bg-[#262626] text-white rounded-xl pl-11 pr-4 py-3 outline-none border border-gray-700 focus:border-yellow-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
        {cards.map((card) => (
          <div key={card.title} className="bg-[#262626] rounded-2xl p-5">
            <div className="flex justify-between items-center">
              <p className="text-gray-400 text-sm">{card.title}</p>
              <div className="text-yellow-400 text-xl">{card.icon}</div>
            </div>
            <h2 className="text-white text-xl font-bold mt-2">{card.value}</h2>
          </div>
        ))}
      </div>

      <CustomerTable customers={customers} searchTerm={searchTerm} />
    </div>
  );
};

export default CustomerManagement;

import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FaUsers,
  FaReceipt,
  FaMoneyBillWave,
  FaCalendarDay,
} from "react-icons/fa";

import { getStaffReport } from "../../https";
import FullScreenLoader from "../../components/shared/FullScreenLoader";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const StaffManagement = () => {
  useEffect(() => {
    document.title = "Satya POS | Staff";
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["staff-report"],
    queryFn: async () => {
      const response = await getStaffReport();
      return response.data.data;
    },
    refetchInterval: 30000,
  });

  if (isLoading) return <FullScreenLoader />;

  const staff = data || [];

  const totals = staff.reduce(
    (acc, member) => {
      acc.totalOrders += member.totalOrders;
      acc.totalRevenue += member.totalRevenue;
      acc.todayRevenue += member.todayRevenue;
      return acc;
    },
    { totalOrders: 0, totalRevenue: 0, todayRevenue: 0 }
  );

  const cards = [
    {
      title: "Total Staff",
      value: staff.length,
      icon: <FaUsers />,
    },
    {
      title: "Total Orders Taken",
      value: totals.totalOrders,
      icon: <FaReceipt />,
    },
    {
      title: "Total Revenue",
      value: currency.format(totals.totalRevenue),
      icon: <FaMoneyBillWave />,
    },
    {
      title: "Today's Revenue",
      value: currency.format(totals.todayRevenue),
      icon: <FaCalendarDay />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#1f1f1f] px-6 py-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Staff Management</h1>
        <p className="text-gray-400 mt-2">
          Staff details and per-staff order &amp; revenue reports.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
        {cards.map((card) => (
          <div key={card.title} className="bg-[#262626] rounded-2xl p-5">
            <p className="text-gray-400 flex items-center gap-2">
              {card.icon}
              {card.title}
            </p>
            <h2 className="text-white text-3xl font-bold mt-2">
              {card.value}
            </h2>
          </div>
        ))}
      </div>

      <div className="bg-[#262626] rounded-2xl border border-gray-700 mt-8 overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-700 text-gray-400">
            <tr>
              <th className="text-left p-4">Staff</th>
              <th className="text-left">Role</th>
              <th className="text-left">Status</th>
              <th className="text-left">Total Orders</th>
              <th className="text-left">Revenue</th>
              <th className="text-left">Today's Revenue</th>
            </tr>
          </thead>

          <tbody>
            {staff.map((member) => (
              <tr key={member._id} className="border-b border-gray-800">
                <td className="p-4 text-white">{member.name}</td>
                <td className="text-gray-300">{member.role}</td>
                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      member.status === "Active"
                        ? "bg-green-600 text-white"
                        : "bg-gray-600 text-gray-200"
                    }`}
                  >
                    {member.status}
                  </span>
                </td>
                <td className="text-white">{member.totalOrders}</td>
                <td className="text-white">
                  {currency.format(member.totalRevenue)}
                </td>
                <td className="text-[#f6b100] font-semibold">
                  {currency.format(member.todayRevenue)}
                </td>
              </tr>
            ))}

            {staff.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 p-8">
                  No staff added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffManagement;

import React from "react";
import { getAvatarName } from "../../utils";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Customer list for the admin "Customers" tab. Rows are populated
// automatically - a customer appears here the moment they sign up on
// the self-service home page, and totalOrders/totalSpent/loyaltyPoints
// tick up on their own every time one of their orders is completed
// (see updateCustomerStats in orderController.js). Nothing here is
// hand-entered by an admin.
const CustomerTable = ({ customers, searchTerm = "" }) => {
  const filtered = searchTerm
    ? customers.filter((c) => {
        const term = searchTerm.toLowerCase();
        return (
          c.name?.toLowerCase().includes(term) ||
          c.phone?.toLowerCase().includes(term) ||
          c.email?.toLowerCase().includes(term)
        );
      })
    : customers;

  return (
    <div className="bg-[#262626] rounded-2xl border border-gray-700 mt-8 overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-gray-700 text-gray-400">
          <tr>
            <th className="text-left p-4">Customer</th>
            <th className="text-left">Contact</th>
            <th className="text-left">Status</th>
            <th className="text-left">Total Orders</th>
            <th className="text-left">Total Spent</th>
            <th className="text-left">Loyalty Points</th>
            <th className="text-left">Last Order</th>
            <th className="text-left">Signed Up</th>
          </tr>
        </thead>

        <tbody>
          {filtered.length ? (
            filtered.map((customer) => (
              <tr key={customer._id} className="border-b border-gray-800">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-400 text-black rounded-full h-9 w-9 flex items-center justify-center font-bold text-sm shrink-0">
                      {getAvatarName(customer.name)}
                    </div>
                    <div className="text-white font-semibold">
                      {customer.name}
                    </div>
                  </div>
                </td>

                <td>
                  <div className="text-gray-300">{customer.phone}</div>
                  {customer.email && (
                    <div className="text-xs text-gray-500">
                      {customer.email}
                    </div>
                  )}
                </td>

                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      customer.status === "VIP"
                        ? "bg-yellow-400 text-black"
                        : "bg-gray-600 text-white"
                    }`}
                  >
                    {customer.status || "Regular"}
                  </span>
                </td>

                <td className="text-white">{customer.totalOrders || 0}</td>
                <td className="text-white">
                  {currency.format(customer.totalSpent || 0)}
                </td>
                <td className="text-[#f6b100] font-semibold">
                  {customer.loyaltyPoints || 0}
                </td>
                <td className="text-gray-300">
                  {formatDate(customer.lastOrderDate)}
                </td>
                <td className="text-gray-300">
                  {formatDate(customer.createdAt)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="text-center text-gray-500 p-6">
                {searchTerm
                  ? "No customers match your search."
                  : "No customers yet. They'll appear here as soon as someone signs up and orders."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerTable;

import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

// Staff list with performance counters (total orders taken, total /
// weekly / monthly / today's revenue) plus edit & delete actions.
const StaffTable = ({ staff, onEdit, onDelete }) => {
  return (
    <div className="bg-[#262626] rounded-2xl border border-gray-700 mt-8 overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-gray-700 text-gray-400">
          <tr>
            <th className="text-left p-4">Staff</th>
            <th className="text-left">Role</th>
            <th className="text-left">Status</th>
            <th className="text-left">Total Orders</th>
            <th className="text-left">Total Revenue</th>
            <th className="text-left">This Week</th>
            <th className="text-left">This Month</th>
            <th className="text-left">Today</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {staff.length ? (
            staff.map((member) => (
              <tr key={member._id} className="border-b border-gray-800">
                <td className="p-4">
                  <div className="text-white font-semibold">{member.name}</div>
                  <div className="text-xs text-gray-500">{member.email}</div>
                </td>

                <td className="text-gray-300">{member.role || "-"}</td>

                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      member.status === "Inactive"
                        ? "bg-gray-600 text-white"
                        : "bg-green-600 text-white"
                    }`}
                  >
                    {member.status || "Active"}
                  </span>
                </td>

                <td className="text-white">{member.totalOrders || 0}</td>
                <td className="text-white">
                  {currency.format(member.totalRevenue || 0)}
                </td>
                <td className="text-white">
                  {currency.format(member.weeklyRevenue || 0)}
                </td>
                <td className="text-white">
                  {currency.format(member.monthlyRevenue || 0)}
                </td>
                <td className="text-[#f6b100] font-semibold">
                  {currency.format(member.todayRevenue || 0)}
                </td>

                <td className="text-center">
                  {onEdit || onDelete ? (
                    <div className="flex justify-center gap-4">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(member)}
                          className="text-blue-400 hover:text-blue-300"
                          title="Edit staff"
                        >
                          <FaEdit />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(member)}
                          className="text-red-400 hover:text-red-300"
                          title="Remove staff"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-600 text-sm">View only</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={9} className="text-center text-gray-500 p-6">
                No staff added yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StaffTable;

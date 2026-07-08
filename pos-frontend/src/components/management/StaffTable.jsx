import React from "react";
import { FaEdit, FaTrash, FaReceipt } from "react-icons/fa";
import { getAvatarName } from "../../utils";

const StaffTable = ({ staff, onEdit, onDelete, onViewOrders }) => {
  return (
    <div className="bg-[#262626] rounded-2xl border border-gray-700 mt-8 overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-gray-700 text-gray-400 text-sm">
          <tr>
            <th className="text-left p-4">Staff</th>
            <th className="text-left">Role</th>
            <th className="text-left">Contact</th>
            <th className="text-left">Salary</th>
            <th className="text-left">Status</th>
            <th className="text-left">Orders Sold</th>
            <th className="text-left">Revenue</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {staff.map((member) => (
            <tr
              key={member._id}
              className="border-b border-gray-800 last:border-b-0"
            >
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-[#f6b100] flex items-center justify-center text-sm font-bold text-black">
                    {getAvatarName(member.name)}
                  </div>
                  <span className="text-white font-medium">
                    {member.name}
                  </span>
                </div>
              </td>

              <td className="text-gray-300">{member.role}</td>

              <td className="text-gray-300 text-sm">
                <div>{member.email}</div>
                {member.phone && (
                  <div className="text-gray-500">{member.phone}</div>
                )}
              </td>

              <td className="text-white">
                ₹{Number(member.salary || 0).toLocaleString("en-IN")}
              </td>

              <td>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    member.status === "Active"
                      ? "bg-green-600 text-white"
                      : "bg-gray-600 text-gray-200"
                  }`}
                >
                  {member.status}
                </span>
              </td>

              <td>
                <button
                  onClick={() => onViewOrders(member)}
                  className="text-white hover:text-[#f6b100] flex items-center gap-1.5"
                  title="View completed orders"
                >
                  <FaReceipt className="text-xs" />
                  {member.totalOrders || 0}
                </button>
              </td>

              <td className="text-[#f6b100] font-semibold">
                ₹
                {Number(member.totalRevenue || 0).toLocaleString(
                  "en-IN",
                  { minimumFractionDigits: 2 }
                )}
              </td>

              <td>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => onEdit(member)}
                    className="text-blue-400 hover:text-blue-300"
                    title="Edit staff"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => onDelete(member)}
                    className="text-red-400 hover:text-red-300"
                    title="Delete staff"
                  >
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {staff.length === 0 && (
        <div className="flex justify-center items-center h-40 text-gray-500">
          No staff members added yet.
        </div>
      )}
    </div>
  );
};

export default StaffTable;

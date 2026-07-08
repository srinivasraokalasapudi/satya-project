import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

// Pure presentational table. Whether Edit/Delete columns even render is
// controlled entirely by `isAdmin` — non-admins (e.g. Waiters) only ever
// get the read-only view of staff details, never the action buttons.
const StaffTable = ({ staff, isAdmin, onEdit, onDelete }) => {
  if (!staff || staff.length === 0) {
    return (
      <div className="bg-[#262626] rounded-2xl border border-gray-700 mt-8 p-10 text-center text-gray-400">
        No staff members yet.
      </div>
    );
  }

  return (
    <div className="bg-[#262626] rounded-2xl border border-gray-700 mt-8 overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-gray-700 text-gray-400">
          <tr>
            <th className="text-left p-4">Name</th>
            <th className="text-left">Email</th>
            <th className="text-left">Phone</th>
            <th className="text-left">Role</th>
            <th className="text-left">Salary</th>
            <th className="text-left">Status</th>
            {isAdmin && <th className="text-center">Actions</th>}
          </tr>
        </thead>

        <tbody>
          {staff.map((member) => (
            <tr key={member._id} className="border-b border-gray-800">
              <td className="p-4 text-white">{member.name}</td>
              <td className="text-gray-300">{member.email}</td>
              <td className="text-gray-300">{member.phone || "-"}</td>
              <td className="text-gray-300">{member.role}</td>
              <td className="text-gray-300">
                {member.salary ? `₹${member.salary}` : "-"}
              </td>
              <td>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    member.status === "Active"
                      ? "bg-green-600 text-white"
                      : "bg-gray-500 text-white"
                  }`}
                >
                  {member.status}
                </span>
              </td>

              {isAdmin && (
                <td>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => onEdit(member)}
                      aria-label={`Edit ${member.name}`}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => onDelete(member)}
                      aria-label={`Delete ${member.name}`}
                      className="text-red-400 hover:text-red-300"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StaffTable;

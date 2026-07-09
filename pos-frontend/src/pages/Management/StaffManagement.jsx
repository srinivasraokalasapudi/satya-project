<<<<<<< HEAD
import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
=======
import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
>>>>>>> e5ee836 (Add staff selection on orders, staff CRUD, and staff revenue reports)
import {
  FaUsers,
  FaClipboardList,
  FaMoneyBillWave,
  FaCalendarDay,
<<<<<<< HEAD
} from "react-icons/fa";

import { getStaffReports } from "../../https";
import FullScreenLoader from "../../components/shared/FullScreenLoader";
=======
  FaPlus,
} from "react-icons/fa";

import { getStaffReports, addStaff, updateStaff, deleteStaff } from "../../https";
import FullScreenLoader from "../../components/shared/FullScreenLoader";
import ConfirmDialog from "../../components/shared/ConfirmDialog";
import StaffTable from "../../components/management/StaffTable";
import StaffFormModal from "../../components/management/StaffFormModal";
>>>>>>> e5ee836 (Add staff selection on orders, staff CRUD, and staff revenue reports)

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const StaffManagement = () => {
  useEffect(() => {
    document.title = "Satya POS | Staff";
  }, []);

<<<<<<< HEAD
=======
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [deletingStaff, setDeletingStaff] = useState(null);

>>>>>>> e5ee836 (Add staff selection on orders, staff CRUD, and staff revenue reports)
  const { data, isLoading } = useQuery({
    queryKey: ["staff-reports"],
    queryFn: async () => {
      const response = await getStaffReports();
      return response.data;
    },
    refetchInterval: 30000,
  });

<<<<<<< HEAD
=======
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["staff-reports"] });

  const createMutation = useMutation({
    mutationFn: addStaff,
    onSuccess: () => {
      enqueueSnackbar("Staff added successfully!", { variant: "success" });
      setIsFormOpen(false);
      invalidate();
    },
    onError: (error) => {
      enqueueSnackbar(error?.response?.data?.message || "Failed to add staff", {
        variant: "error",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateStaff,
    onSuccess: () => {
      enqueueSnackbar("Staff updated successfully!", { variant: "success" });
      setIsFormOpen(false);
      setEditingStaff(null);
      invalidate();
    },
    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to update staff",
        { variant: "error" }
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStaff,
    onSuccess: () => {
      enqueueSnackbar("Staff removed successfully!", { variant: "success" });
      setDeletingStaff(null);
      invalidate();
    },
    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to remove staff",
        { variant: "error" }
      );
      setDeletingStaff(null);
    },
  });

>>>>>>> e5ee836 (Add staff selection on orders, staff CRUD, and staff revenue reports)
  if (isLoading) return <FullScreenLoader />;

  const staff = data?.data || [];

  const totals = staff.reduce(
    (sum, member) => ({
      totalOrders: sum.totalOrders + (member.totalOrders || 0),
<<<<<<< HEAD
      revenue: sum.revenue + (member.revenue || 0),
      todayRevenue: sum.todayRevenue + (member.todayRevenue || 0),
    }),
    { totalOrders: 0, revenue: 0, todayRevenue: 0 }
  );

  const cards = [
    {
      title: "Total Staff",
      value: staff.length,
      icon: <FaUsers />,
    },
=======
      totalRevenue: sum.totalRevenue + (member.totalRevenue || 0),
      weeklyRevenue: sum.weeklyRevenue + (member.weeklyRevenue || 0),
      monthlyRevenue: sum.monthlyRevenue + (member.monthlyRevenue || 0),
      todayRevenue: sum.todayRevenue + (member.todayRevenue || 0),
    }),
    {
      totalOrders: 0,
      totalRevenue: 0,
      weeklyRevenue: 0,
      monthlyRevenue: 0,
      todayRevenue: 0,
    }
  );

  const cards = [
    { title: "Total Staff", value: staff.length, icon: <FaUsers /> },
>>>>>>> e5ee836 (Add staff selection on orders, staff CRUD, and staff revenue reports)
    {
      title: "Total Orders Taken",
      value: totals.totalOrders,
      icon: <FaClipboardList />,
    },
    {
      title: "Total Revenue",
<<<<<<< HEAD
      value: currency.format(totals.revenue),
=======
      value: currency.format(totals.totalRevenue),
      icon: <FaMoneyBillWave />,
    },
    {
      title: "This Week",
      value: currency.format(totals.weeklyRevenue),
      icon: <FaMoneyBillWave />,
    },
    {
      title: "This Month",
      value: currency.format(totals.monthlyRevenue),
>>>>>>> e5ee836 (Add staff selection on orders, staff CRUD, and staff revenue reports)
      icon: <FaMoneyBillWave />,
    },
    {
      title: "Today's Revenue",
      value: currency.format(totals.todayRevenue),
      icon: <FaCalendarDay />,
    },
  ];

<<<<<<< HEAD
  return (
    <div className="min-h-screen bg-[#1f1f1f] px-6 py-8">
      <h1 className="text-3xl font-bold text-white">Staff Reports</h1>
      <p className="text-gray-400 mt-2">
        Orders taken and revenue generated by each staff member.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
        {cards.map((card) => (
          <div key={card.title} className="bg-[#262626] rounded-2xl p-5">
            <div className="flex justify-between items-center">
              <p className="text-gray-400">{card.title}</p>
              <div className="text-yellow-400 text-2xl">{card.icon}</div>
            </div>
            <h2 className="text-white text-2xl font-bold mt-2">
              {card.value}
            </h2>
=======
  const handleSubmit = (formData) => {
    if (editingStaff) {
      updateMutation.mutate({ id: editingStaff._id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="min-h-screen bg-[#1f1f1f] px-6 py-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Staff Reports</h1>
          <p className="text-gray-400 mt-2">
            Manage staff and track orders taken & revenue generated by each.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingStaff(null);
            setIsFormOpen(true);
          }}
          className="bg-yellow-400 text-black px-5 py-3 rounded-xl font-semibold flex items-center gap-2"
        >
          <FaPlus />
          Add Staff
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mt-8">
        {cards.map((card) => (
          <div key={card.title} className="bg-[#262626] rounded-2xl p-5">
            <div className="flex justify-between items-center">
              <p className="text-gray-400 text-sm">{card.title}</p>
              <div className="text-yellow-400 text-xl">{card.icon}</div>
            </div>
            <h2 className="text-white text-xl font-bold mt-2">{card.value}</h2>
>>>>>>> e5ee836 (Add staff selection on orders, staff CRUD, and staff revenue reports)
          </div>
        ))}
      </div>

<<<<<<< HEAD
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
            {staff.length ? (
              staff.map((member) => (
                <tr key={member._id} className="border-b border-gray-800">
                  <td className="p-4 text-white font-semibold">
                    {member.name}
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
                  <td className="text-white">{member.totalOrders}</td>
                  <td className="text-white">
                    {currency.format(member.revenue || 0)}
                  </td>
                  <td className="text-[#f6b100] font-semibold">
                    {currency.format(member.todayRevenue || 0)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 p-6">
                  No staff added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
=======
      <StaffTable
        staff={staff}
        onEdit={(member) => {
          setEditingStaff(member);
          setIsFormOpen(true);
        }}
        onDelete={(member) => setDeletingStaff(member)}
      />

      <StaffFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingStaff(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingStaff}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        isOpen={!!deletingStaff}
        title="Remove staff member?"
        message={
          deletingStaff
            ? `This will permanently remove ${deletingStaff.name} from staff.`
            : ""
        }
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={() => deleteMutation.mutate(deletingStaff._id)}
        onCancel={() => setDeletingStaff(null)}
      />
>>>>>>> e5ee836 (Add staff selection on orders, staff CRUD, and staff revenue reports)
    </div>
  );
};

export default StaffManagement;

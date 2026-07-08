import React, { useEffect, useState } from "react";
import { FaPlus, FaUsers, FaUserCheck, FaReceipt, FaRupeeSign } from "react-icons/fa";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";

import {
  getStaff,
  addStaff,
  updateStaff,
  deleteStaff,
} from "../../https";

import StaffTable from "../../components/management/StaffTable";
import StaffFormModal from "../../components/management/StaffFormModal";
import StaffOrdersModal from "../../components/management/StaffOrdersModal";
import ConfirmDialog from "../../components/shared/ConfirmDialog";

const StaffManagement = () => {
  useEffect(() => {
    document.title = "Satya POS | Staff";
  }, []);

  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState(null);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [staffToView, setStaffToView] = useState(null);

  // ---------------- FETCH ----------------

  const { data: resData, isLoading, isError } = useQuery({
    queryKey: ["staff"],
    queryFn: async () => await getStaff(),
  });

  useEffect(() => {
    if (isError) {
      enqueueSnackbar("Failed to load staff.", { variant: "error" });
    }
  }, [isError]);

  const staff = resData?.data?.data || [];

  // ---------------- SUMMARY ----------------

  const activeCount = staff.filter((s) => s.status === "Active").length;
  const totalOrders = staff.reduce((sum, s) => sum + (s.totalOrders || 0), 0);
  const totalRevenue = staff.reduce(
    (sum, s) => sum + (s.totalRevenue || 0),
    0
  );

  // ---------------- MUTATIONS ----------------

  const addMutation = useMutation({
    mutationFn: addStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      enqueueSnackbar("Staff added successfully!", { variant: "success" });
      setIsFormOpen(false);
    },
    onError: (error) => {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to add staff.",
        { variant: "error" }
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      enqueueSnackbar("Staff updated successfully!", { variant: "success" });
      setIsFormOpen(false);
      setStaffToEdit(null);
    },
    onError: (error) => {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to update staff.",
        { variant: "error" }
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      enqueueSnackbar("Staff deleted.", { variant: "success" });
      setStaffToDelete(null);
    },
    onError: (error) => {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to delete staff.",
        { variant: "error" }
      );
      setStaffToDelete(null);
    },
  });

  // ---------------- HANDLERS ----------------

  const handleAddClick = () => {
    setStaffToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (member) => {
    setStaffToEdit(member);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (formData) => {
    if (staffToEdit) {
      updateMutation.mutate({ id: staffToEdit._id, ...formData });
    } else {
      addMutation.mutate(formData);
    }
  };

  const handleConfirmDelete = () => {
    if (staffToDelete) {
      deleteMutation.mutate(staffToDelete._id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1f1f1f] text-white text-xl">
        Loading Staff...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1f1f1f] px-6 py-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Staff</h1>
          <p className="text-gray-400 mt-2">
            Manage employees and track their sales performance.
          </p>
        </div>

        <button
          onClick={handleAddClick}
          className="bg-yellow-400 text-black px-5 py-3 rounded-xl font-semibold flex items-center gap-2"
        >
          <FaPlus />
          Add Staff
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
        <div className="bg-[#262626] rounded-2xl p-5">
          <p className="text-gray-400 flex items-center gap-2">
            <FaUsers /> Total Staff
          </p>
          <h2 className="text-white text-3xl font-bold mt-2">
            {staff.length}
          </h2>
        </div>

        <div className="bg-[#262626] rounded-2xl p-5">
          <p className="text-gray-400 flex items-center gap-2">
            <FaUserCheck /> Active
          </p>
          <h2 className="text-green-400 text-3xl font-bold mt-2">
            {activeCount}
          </h2>
        </div>

        <div className="bg-[#262626] rounded-2xl p-5">
          <p className="text-gray-400 flex items-center gap-2">
            <FaReceipt /> Orders Sold
          </p>
          <h2 className="text-white text-3xl font-bold mt-2">
            {totalOrders}
          </h2>
        </div>

        <div className="bg-[#262626] rounded-2xl p-5">
          <p className="text-gray-400 flex items-center gap-2">
            <FaRupeeSign /> Revenue Generated
          </p>
          <h2 className="text-[#f6b100] text-3xl font-bold mt-2">
            ₹{totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </h2>
        </div>
      </div>

      {/* Staff Table */}
      <StaffTable
        staff={staff}
        onEdit={handleEditClick}
        onDelete={setStaffToDelete}
        onViewOrders={setStaffToView}
      />

      {/* Add / Edit Modal */}
      <StaffFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setStaffToEdit(null);
        }}
        staffToEdit={staffToEdit}
        onSubmit={handleFormSubmit}
        isSubmitting={addMutation.isPending || updateMutation.isPending}
      />

      {/* Per-staff completed orders */}
      <StaffOrdersModal
        isOpen={!!staffToView}
        onClose={() => setStaffToView(null)}
        staffId={staffToView?._id}
        staffName={staffToView?.name}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!staffToDelete}
        title="Delete this staff member?"
        message={
          staffToDelete
            ? `This will permanently remove ${staffToDelete.name} from staff. This cannot be undone.`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setStaffToDelete(null)}
      />
    </div>
  );
};

export default StaffManagement;

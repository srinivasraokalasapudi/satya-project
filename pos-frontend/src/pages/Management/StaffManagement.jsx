import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { FaPlus, FaUsers } from "react-icons/fa";

import { getStaff, addStaff, updateStaff, deleteStaff } from "../../https";
import StaffTable from "../../components/management/StaffTable";
import Modal from "../../components/shared/Modal";
import ConfirmDialog from "../../components/shared/ConfirmDialog";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  role: "Waiter",
  salary: "",
  status: "Active",
};

const StaffManagement = () => {
  const queryClient = useQueryClient();
  const { role: myRole } = useSelector((state) => state.user);
  const isAdmin = myRole === "Admin";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null); // null = "adding"
  const [formData, setFormData] = useState(emptyForm);
  const [staffToDelete, setStaffToDelete] = useState(null);

  useEffect(() => {
    document.title = "Satya POS | Staff";
  }, []);

  const {
    data: resData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      return await getStaff();
    },
  });

  useEffect(() => {
    if (isError) {
      enqueueSnackbar("Failed to load staff.", { variant: "error" });
    }
  }, [isError]);

  const staff = resData?.data?.data || [];

  // ---- Mutations (only ever triggered from Admin-only UI, but the
  // backend is the real gatekeeper — it rejects these for non-admins
  // regardless of what the frontend shows) ----

  const invalidateStaff = () =>
    queryClient.invalidateQueries({ queryKey: ["staff"] });

  const addMutation = useMutation({
    mutationFn: (data) => addStaff(data),
    onSuccess: () => {
      enqueueSnackbar("Staff member added.", { variant: "success" });
      invalidateStaff();
      closeModal();
    },
    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message || "Could not add staff member.",
        { variant: "error" }
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => updateStaff({ id, ...data }),
    onSuccess: () => {
      enqueueSnackbar("Staff member updated.", { variant: "success" });
      invalidateStaff();
      closeModal();
    },
    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message || "Could not update staff member.",
        { variant: "error" }
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteStaff(id),
    onSuccess: () => {
      enqueueSnackbar("Staff member removed.", { variant: "success" });
      invalidateStaff();
      setStaffToDelete(null);
    },
    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message || "Could not remove staff member.",
        { variant: "error" }
      );
      setStaffToDelete(null);
    },
  });

  // ---- Modal helpers ----

  const openAddModal = () => {
    setEditingStaff(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (member) => {
    setEditingStaff(member);
    setFormData({
      name: member.name || "",
      email: member.email || "",
      phone: member.phone || "",
      role: member.role || "Waiter",
      salary: member.salary ?? "",
      status: member.status || "Active",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
    setFormData(emptyForm);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingStaff) {
      updateMutation.mutate({ id: editingStaff._id, ...formData });
    } else {
      addMutation.mutate(formData);
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
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FaUsers className="text-yellow-400" />
            Staff Management
          </h1>
          <p className="text-gray-400 mt-2">
            {isAdmin
              ? "Manage employees, roles and status."
              : "View employee details. Only the owner can make changes."}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openAddModal}
            className="bg-yellow-400 text-black px-5 py-3 rounded-xl font-semibold flex items-center gap-2 self-start"
          >
            <FaPlus />
            Add Staff
          </button>
        )}
      </div>

      <StaffTable
        staff={staff}
        isAdmin={isAdmin}
        onEdit={openEditModal}
        onDelete={(member) => setStaffToDelete(member)}
      />

      {/* Add / Edit modal — only ever opened via Admin-only buttons above */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingStaff ? "Edit Staff Member" : "Add Staff Member"}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[#ababab] mb-1 text-sm font-medium">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg p-3 bg-[#1f1f1f] text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#ababab] mb-1 text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-lg p-3 bg-[#1f1f1f] text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#ababab] mb-1 text-sm font-medium">
              Phone
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-lg p-3 bg-[#1f1f1f] text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#ababab] mb-1 text-sm font-medium">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full rounded-lg p-3 bg-[#1f1f1f] text-white focus:outline-none"
            >
              <option value="Waiter">Waiter</option>
              <option value="Chef">Chef</option>
              <option value="Cashier">Cashier</option>
              <option value="Manager">Manager</option>
            </select>
          </div>

          <div>
            <label className="block text-[#ababab] mb-1 text-sm font-medium">
              Salary
            </label>
            <input
              type="number"
              name="salary"
              min="0"
              value={formData.salary}
              onChange={handleChange}
              className="w-full rounded-lg p-3 bg-[#1f1f1f] text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#ababab] mb-1 text-sm font-medium">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-lg p-3 bg-[#1f1f1f] text-white focus:outline-none"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={addMutation.isPending || updateMutation.isPending}
            className="w-full rounded-lg mt-2 py-3 text-lg bg-yellow-400 text-gray-900 font-bold disabled:opacity-60"
          >
            {editingStaff ? "Save Changes" : "Add Staff"}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!staffToDelete}
        title="Remove staff member?"
        message={
          staffToDelete
            ? `This will permanently remove ${staffToDelete.name} from the staff list.`
            : ""
        }
        confirmText="Remove"
        cancelText="Cancel"
        onCancel={() => setStaffToDelete(null)}
        onConfirm={() => deleteMutation.mutate(staffToDelete._id)}
      />
    </div>
  );
};

export default StaffManagement;

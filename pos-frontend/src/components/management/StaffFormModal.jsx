import React, { useEffect, useState } from "react";
import Modal from "../shared/Modal";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  role: "",
  salary: "",
  status: "Active",
};

// Add/Edit form for a staff member. Pass `staffToEdit` to pre-fill the
// form for editing, or leave it null to create a new staff member.
// `onSubmit` receives the cleaned form payload; the parent owns the
// actual addStaff/updateStaff mutation so cache invalidation stays in
// one place.
const StaffFormModal = ({
  isOpen,
  onClose,
  staffToEdit,
  onSubmit,
  isSubmitting,
}) => {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (staffToEdit) {
      setForm({
        name: staffToEdit.name || "",
        email: staffToEdit.email || "",
        phone: staffToEdit.phone || "",
        role: staffToEdit.role || "",
        salary: staffToEdit.salary ?? "",
        status: staffToEdit.status || "Active",
      });
    } else {
      setForm(emptyForm);
    }
  }, [staffToEdit, isOpen]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      role: form.role.trim(),
      salary: form.salary === "" ? 0 : Number(form.salary),
      status: form.status,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={staffToEdit ? "Edit Staff" : "Add Staff"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-300 mb-2 text-sm">
            Name
          </label>
          <input
            type="text"
            required
            placeholder="Enter full name"
            value={form.name}
            onChange={handleChange("name")}
            className="w-full bg-[#262626] text-white rounded-lg px-4 py-3 outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2 text-sm">
            Email
          </label>
          <input
            type="email"
            required
            placeholder="Enter email address"
            value={form.email}
            onChange={handleChange("email")}
            className="w-full bg-[#262626] text-white rounded-lg px-4 py-3 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 mb-2 text-sm">
              Phone
            </label>
            <input
              type="text"
              placeholder="10-digit number"
              value={form.phone}
              onChange={handleChange("phone")}
              className="w-full bg-[#262626] text-white rounded-lg px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm">
              Role
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Waiter, Chef"
              value={form.role}
              onChange={handleChange("role")}
              className="w-full bg-[#262626] text-white rounded-lg px-4 py-3 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 mb-2 text-sm">
              Salary (₹)
            </label>
            <input
              type="number"
              min={0}
              placeholder="0"
              value={form.salary}
              onChange={handleChange("salary")}
              className="w-full bg-[#262626] text-white rounded-lg px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm">
              Status
            </label>
            <select
              value={form.status}
              onChange={handleChange("status")}
              className="w-full bg-[#262626] text-white rounded-lg px-4 py-3 outline-none"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#f6b100] text-[#1f1f1f] font-bold py-3 rounded-lg hover:bg-[#e0a300] transition disabled:opacity-60"
        >
          {isSubmitting
            ? "Saving..."
            : staffToEdit
            ? "Save Changes"
            : "Add Staff"}
        </button>
      </form>
    </Modal>
  );
};

export default StaffFormModal;

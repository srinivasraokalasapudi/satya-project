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

// Shared add/edit form. `initialData` is null when adding a new staff
// member, or the staff object being edited.
const StaffFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
}) => {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!isOpen) return;

    setForm(
      initialData
        ? {
            name: initialData.name || "",
            email: initialData.email || "",
            phone: initialData.phone || "",
            role: initialData.role || "",
            salary:
              initialData.salary === undefined || initialData.salary === null
                ? ""
                : String(initialData.salary),
            status: initialData.status || "Active",
          }
        : emptyForm
    );
  }, [isOpen, initialData]);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = () => {
    onSubmit({
      ...form,
      salary: Number(form.salary) || 0,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Staff" : "Add Staff"}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-gray-300 mb-2">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={handleChange("name")}
            placeholder="Full name"
            className="w-full bg-[#262626] text-white rounded-lg px-4 py-3 outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={handleChange("email")}
            placeholder="email@example.com"
            className="w-full bg-[#262626] text-white rounded-lg px-4 py-3 outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Phone</label>
          <input
            type="text"
            value={form.phone}
            onChange={handleChange("phone")}
            placeholder="10-digit phone number"
            className="w-full bg-[#262626] text-white rounded-lg px-4 py-3 outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Role</label>
          <input
            type="text"
            value={form.role}
            onChange={handleChange("role")}
            placeholder="Waiter, Chef, Cashier..."
            className="w-full bg-[#262626] text-white rounded-lg px-4 py-3 outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Salary</label>
          <input
            type="number"
            min={0}
            value={form.salary}
            onChange={handleChange("salary")}
            placeholder="Monthly salary"
            className="w-full bg-[#262626] text-white rounded-lg px-4 py-3 outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Status</label>
          <select
            value={form.status}
            onChange={handleChange("status")}
            className="w-full bg-[#262626] text-white rounded-lg px-4 py-3 outline-none"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-[#f6b100] text-[#1f1f1f] font-bold py-3 rounded-lg hover:bg-[#e0a300] transition disabled:opacity-60"
        >
          {isSubmitting
            ? "Saving..."
            : initialData
            ? "Save Changes"
            : "Add Staff"}
        </button>
      </div>
    </Modal>
  );
};

export default StaffFormModal;

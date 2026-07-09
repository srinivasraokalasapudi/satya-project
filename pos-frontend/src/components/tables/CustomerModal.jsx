import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";

import Modal from "../shared/Modal";
import { getStaff } from "../../https";
import {
  setCustomer,
  updateTable,
  setOrderStaff,
} from "../../redux/slices/customerSlice";

const CustomerModal = ({
  isOpen,
  onClose,
  selectedTable,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState(1);
  const [staffId, setStaffId] = useState("");

  const { data: staffRes } = useQuery({
    queryKey: ["staff-list", "active"],
    queryFn: () => getStaff({ status: "Active" }),
    enabled: isOpen,
  });

  const staffOptions = staffRes?.data?.data || [];

  const handleStartOrder = () => {
    if (!name.trim()) {
      enqueueSnackbar("Customer name is required!", {
        variant: "warning",
      });
      return;
    }

    if (!phone.trim()) {
      enqueueSnackbar("Phone number is required!", {
        variant: "warning",
      });
      return;
    }

    if (phone.length !== 10) {
      enqueueSnackbar("Enter a valid 10-digit phone number!", {
        variant: "warning",
      });
      return;
    }

    if (!staffId) {
      enqueueSnackbar("Please select the staff taking this order!", {
        variant: "warning",
      });
      return;
    }

    const selectedStaff = staffOptions.find((member) => member._id === staffId);

    dispatch(
      setCustomer({
        name,
        phone,
        guests: Number(guests),
      })
    );

    dispatch(
      updateTable({
        table: {
          tableId: selectedTable._id,
          tableNo: selectedTable.tableNo,
        },
      })
    );

    dispatch(
      setOrderStaff({
        id: staffId,
        name: selectedStaff?.name,
        role: selectedStaff?.role,
      })
    );

    onClose();

    navigate("/menu");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Customer Details"
    >
      <div className="space-y-5">

        <div>
          <label className="block text-gray-300 mb-2">
            Customer Name
          </label>

          <input
            type="text"
            placeholder="Enter customer name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#262626] text-white rounded-lg px-4 py-3 outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">
            Phone Number
          </label>

          <input
            type="text"
            maxLength={10}
            placeholder="Enter phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-[#262626] text-white rounded-lg px-4 py-3 outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">
            Number of Guests
          </label>

          <input
            type="number"
            min={1}
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="w-full bg-[#262626] text-white rounded-lg px-4 py-3 outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">
            Staff Taking Order
          </label>

          <select
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
            className="w-full bg-[#262626] text-white rounded-lg px-4 py-3 outline-none"
          >
            <option value="">Select staff</option>
            {staffOptions.map((member) => (
              <option key={member._id} value={member._id}>
                {member.name} {member.role ? `(${member.role})` : ""}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleStartOrder}
          className="w-full bg-[#f6b100] text-[#1f1f1f] font-bold py-3 rounded-lg hover:bg-[#e0a300] transition"
        >
          Start Order
        </button>

      </div>
    </Modal>
  );
};

export default CustomerModal;
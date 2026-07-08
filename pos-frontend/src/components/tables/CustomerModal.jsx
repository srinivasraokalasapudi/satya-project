import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";

import Modal from "../shared/Modal";
import {
  setCustomer,
  updateTable,
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
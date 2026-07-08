import React, { useState } from "react";
import { FaHome } from "react-icons/fa";
import { MdOutlineReorder, MdTableBar } from "react-icons/md";
import { CiCircleMore } from "react-icons/ci";
import { BiSolidDish } from "react-icons/bi";
import { useNavigate, useLocation } from "react-router-dom";
import Modal from "./Modal";
import { useDispatch } from "react-redux";
import { setCustomer } from "../../redux/slices/customerSlice";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guestCount, setGuestCount] = useState(0);
  const [name, setName] = useState();
  const [phone, setPhone] = useState();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const increment = () => {
    if(guestCount >= 6) return;
    setGuestCount((prev) => prev + 1);
  }
  const decrement = () => {
    if(guestCount <= 0) return;
    setGuestCount((prev) => prev - 1);
  }

  const isActive = (path) => location.pathname === path;

  const handleCreateOrder = () => {
    // send the data to store
    dispatch(setCustomer({name, phone, guests: guestCount}));
    // reset local form state so the next "Create Order" doesn't open
    // pre-filled with this customer's details
    setName("");
    setPhone("");
    setGuestCount(0);
    closeModal();
    navigate("/tables");
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#262626] p-2 h-16 flex justify-around items-center z-40">
      <button
        onClick={() => navigate("/")}
        className={`flex flex-col sm:flex-row items-center justify-center font-bold text-xs sm:text-base gap-0 sm:gap-2 ${
          isActive("/") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab]"
        } flex-1 max-w-[110px] h-12 rounded-[20px]`}
      >
        <FaHome className="inline sm:mr-0" size={18} /> <p>Home</p>
      </button>
      <button
        onClick={() => navigate("/orders")}
        className={`flex flex-col sm:flex-row items-center justify-center font-bold text-xs sm:text-base gap-0 sm:gap-2 ${
          isActive("/orders") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab]"
        } flex-1 max-w-[110px] h-12 rounded-[20px]`}
      >
        <MdOutlineReorder className="inline sm:mr-0" size={18} /> <p>Orders</p>
      </button>
      <button
        onClick={() => navigate("/tables")}
        className={`flex flex-col sm:flex-row items-center justify-center font-bold text-xs sm:text-base gap-0 sm:gap-2 ${
          isActive("/tables") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab]"
        } flex-1 max-w-[110px] h-12 rounded-[20px]`}
      >
        <MdTableBar className="inline sm:mr-0" size={18} /> <p>Tables</p>
      </button>
      <button
        onClick={() => navigate("/more")}
        className={`flex flex-col sm:flex-row items-center justify-center font-bold text-xs sm:text-base gap-0 sm:gap-2 ${
          isActive("/more")
            ? "text-[#f5f5f5] bg-[#343434]"
            : "text-[#ababab]"
        } flex-1 max-w-[110px] h-12 rounded-[20px]`}
      >
        <CiCircleMore className="inline sm:mr-0" size={18} />
        <p>More</p>
      </button>

      <button
        disabled={isActive("/tables") || isActive("/menu")}
        onClick={openModal}
        className="absolute left-1/2 -translate-x-1/2 bottom-6 bg-[#F6B100] text-[#f5f5f5] rounded-full p-4 flex items-center justify-center shadow-lg z-50"
      >
        <BiSolidDish size={32} />
      </button>

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Create Order">
        <div>
          <label className="block text-[#ababab] mb-2 text-sm font-medium">Customer Name</label>
          <div className="flex items-center rounded-lg p-3 px-4 bg-[#1f1f1f]">
            <input value={name} onChange={(e) => setName(e.target.value)} type="text" name="" placeholder="Enter customer name" id="" className="bg-transparent flex-1 text-white focus:outline-none"  />
          </div>
        </div>
        <div>
          <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">Customer Phone</label>
          <div className="flex items-center rounded-lg p-3 px-4 bg-[#1f1f1f]">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} type="number" name="" placeholder="+91-9999999999" id="" className="bg-transparent flex-1 text-white focus:outline-none"  />
          </div>
        </div>
        <div>
          <label className="block mb-2 mt-3 text-sm font-medium text-[#ababab]">Guest</label>
          <div className="flex items-center justify-between bg-[#1f1f1f] px-4 py-3 rounded-lg">
            <button onClick={decrement} className="text-yellow-500 text-2xl">&minus;</button>
            <span className="text-white">{guestCount} Person</span>
            <button onClick={increment} className="text-yellow-500 text-2xl">&#43;</button>
          </div>
        </div>
        <button onClick={handleCreateOrder} className="w-full bg-[#F6B100] text-[#f5f5f5] rounded-lg py-3 mt-8 hover:bg-yellow-700">
          Create Order
        </button>
      </Modal>
    </div>
  );
};

export default BottomNav;

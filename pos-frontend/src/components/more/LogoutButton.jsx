import React, { useState } from "react";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import Modal from "../shared/Modal";

const LogoutButton = ({ onConfirm }) => {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    setOpen(false);
    onConfirm();
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
        className="w-full flex items-center justify-center gap-2.5 rounded-2xl border border-red-500/40 bg-red-500/[0.04] backdrop-blur-xl px-6 py-4 text-red-400 font-semibold text-sm tracking-wide hover:bg-red-500/10 hover:border-red-500/70 transition-colors duration-300"
      >
        <LogOut size={18} />
        Log Out
      </motion.button>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Confirm Logout">
        <p className="text-gray-300 text-sm mb-6">
          Are you sure you want to log out of Satya POS? You'll need to sign in again to access the dashboard.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setOpen(false)}
            className="flex-1 rounded-xl border border-white/10 text-gray-300 py-3 text-sm font-semibold hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 rounded-xl bg-red-500 text-white py-3 text-sm font-semibold hover:bg-red-600 transition-colors"
          >
            Log Out
          </button>
        </div>
      </Modal>
    </>
  );
};

export default LogoutButton;

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

// Small reusable Yes/No confirmation dialog. Kept separate from Modal.jsx
// (which is built around a header + free-form children body) since this
// needs its own icon/message layout and Confirm/Cancel action buttons.
const ConfirmDialog = ({
  isOpen,
  icon,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-4 z-[60]"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
            className="bg-[#1a1a1a] rounded-xl shadow-lg w-full max-w-sm p-6 text-center"
          >
            {icon && (
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-600/15 flex items-center justify-center text-green-500 text-2xl">
                {icon}
              </div>
            )}

            <h3 className="text-white text-lg font-semibold">{title}</h3>
            {message && (
              <p className="text-[#ababab] text-sm mt-2">{message}</p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-lg font-semibold text-sm bg-[#2a2a2a] text-[#ababab] hover:bg-[#333]"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-2.5 rounded-lg font-semibold text-sm bg-green-600 text-white hover:bg-green-700"
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;

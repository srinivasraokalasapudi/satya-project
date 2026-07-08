import React from "react";
import { FaLongArrowAltRight } from "react-icons/fa";
import { enqueueSnackbar } from "notistack";
import { resetTable } from "../../https";
import { getAvatarName, getBgColor } from "../../utils";

const TableCard = ({
  id,
  name,
  status,
  initials,
  seats,
  onClick,
  refetchTables,
}) => {

  const handleReset = async (e) => {
    e.stopPropagation();

    const confirmReset = window.confirm(
      "Are you sure you want to reset this table?"
    );

    if (!confirmReset) return;

    try {
      const { data } = await resetTable(id);

      enqueueSnackbar(data.message || "Table reset successfully!", {
        variant: "success",
      });

      if (refetchTables) {
        refetchTables();
      }
    } catch (err) {
      enqueueSnackbar(
        err.response?.data?.message || "Failed to reset table.",
        {
          variant: "error",
        }
      );
    }
  };

  return (
    <div
      onClick={onClick}
      className={`w-full rounded-xl p-5 transition-all duration-300 shadow-md ${
        status === "Booked"
          ? "bg-[#262626]"
          : "bg-[#262626] hover:bg-[#2c2c2c] cursor-pointer"
      }`}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-white text-xl font-semibold">
          Table
          <FaLongArrowAltRight className="inline mx-2 text-gray-400" />
          {name}
        </h1>

        <span
          className={`px-3 py-1 rounded-lg text-sm font-medium ${
            status === "Booked"
              ? "bg-green-700 text-white"
              : "bg-yellow-700 text-white"
          }`}
        >
          {status}
        </span>
      </div>

      <div className="flex justify-center my-8">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
          style={{
            backgroundColor: initials ? getBgColor() : "#1f1f1f",
          }}
        >
          {getAvatarName(initials) || "N/A"}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-gray-400">
          Seats: <span className="text-white">{seats}</span>
        </p>

        {status !== "Booked" && (
          <span className="text-[#f6b100] text-sm font-semibold">
            Start Order →
          </span>
        )}
      </div>

      {status === "Booked" && (
        <button
          onClick={handleReset}
          className="w-full mt-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition"
        >
          Reset Table
        </button>
      )}
    </div>
  );
};

export default TableCard;
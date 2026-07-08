import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import TableCard from "../components/tables/TableCard";
import CustomerModal from "../components/tables/CustomerModal";
import { updateTable } from "../redux/slices/customerSlice";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getTables } from "../https";
import { enqueueSnackbar } from "notistack";

const Tables = () => {
  const [status, setStatus] = useState("all");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const customer = useSelector((state) => state.customer);

  // Customer Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);

  useEffect(() => {
    document.title = "POS | Tables";
  }, []);

  const {
    data: resData,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["tables"],
    queryFn: async () => {
      return await getTables();
    },
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (isError) {
      enqueueSnackbar("Something went wrong!", {
        variant: "error",
      });
    }
  }, [isError]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1f1f1f] text-white text-xl">
        Loading Tables...
      </div>
    );
  }

  const tables =
    status === "all"
      ? resData?.data?.data || []
      : resData?.data?.data?.filter(
          (table) => table.status === "Booked"
        ) || [];

  const handleTableClick = (table) => {
    if (table.status === "Booked") {
      enqueueSnackbar("This table is already booked!", {
        variant: "warning",
      });
      return;
    }

    setSelectedTable(table);

    // Customer details were already collected via the "Create Order"
    // button on the bottom nav — don't ask again, just assign the table
    // and go straight to the menu.
    if (customer.customerName && customer.customerPhone) {
      dispatch(
        updateTable({
          table: {
            tableId: table._id,
            tableNo: table.tableNo,
          },
        })
      );
      navigate("/menu");
      return;
    }

    // No customer on record yet (e.g. navigated here directly) — fall
    // back to asking for their details before starting the order.
    setIsModalOpen(true);
  };

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-10 py-5">

        <div className="flex items-center gap-4">
          <BackButton />

          <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
            Tables
          </h1>
        </div>

        <div className="flex items-center gap-4">

          <button
            onClick={() => setStatus("all")}
            className={`px-5 py-2 rounded-lg font-semibold ${
              status === "all"
                ? "bg-[#383838] text-white"
                : "text-[#ababab]"
            }`}
          >
            All
          </button>

          <button
            onClick={() => setStatus("booked")}
            className={`px-5 py-2 rounded-lg font-semibold ${
              status === "booked"
                ? "bg-[#383838] text-white"
                : "text-[#ababab]"
            }`}
          >
            Booked
          </button>

        </div>
      </div>

      {/* Tables */}
      <div className="px-8 pb-24 h-[calc(100vh-180px)] overflow-y-auto scrollbar-hide">

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">

          {tables.map((table) => (
            <TableCard
              key={table._id}
              id={table._id}
              name={table.tableNo}
              status={table.status}
              initials={table?.currentOrder?.customerDetails?.name}
              seats={table.seats}
              onClick={() => handleTableClick(table)}
              refetchTables={() => window.location.reload()}
            />
          ))}

        </div>

        {tables.length === 0 && (
          <div className="flex justify-center items-center h-60 text-gray-400 text-lg">
            No tables found.
          </div>
        )}

      </div>

      {/* Customer Details Modal */}

      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedTable={selectedTable}
      />

      <BottomNav />
    </section>
  );
};

export default Tables;
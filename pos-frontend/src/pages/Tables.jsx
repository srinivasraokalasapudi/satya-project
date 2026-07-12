import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import { TableCardSkeleton } from "../components/shared/Skeleton";
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

  // Order-QR Modal State
  const [qrTable, setQrTable] = useState(null);

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

  const allTables = [...(resData?.data?.data || [])].sort(
    (a, b) => a.tableNo - b.tableNo
  );

  const tables =
    status === "all"
      ? allTables
      : allTables.filter((table) => table.status === "Booked");

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

          {isLoading ? (
            Array.from({ length: 10 }).map((_, i) => <TableCardSkeleton key={i} />)
          ) : (
            tables.map((table) => (
            <TableCard
              key={table._id}
              id={table._id}
              name={table.tableNo}
              status={table.status}
              initials={table?.currentOrder?.customerDetails?.name}
              seats={table.seats}
              onClick={() => handleTableClick(table)}
              refetchTables={() => window.location.reload()}
              onShowQr={setQrTable}
            />
            ))
          )}

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

      {/* Order QR Modal */}
      {qrTable && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-6"
          onClick={() => setQrTable(null)}
        >
          <div
            className="bg-[#262626] rounded-xl p-6 max-w-xs w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-white text-lg font-bold mb-1">
              Table {qrTable.name}
            </h2>
            <p className="text-[#ababab] text-sm mb-4">
              Customers scan this to order from their phone
            </p>

            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                `${window.location.origin}/order/${qrTable.id}`
              )}`}
              alt={`QR code to order at table ${qrTable.name}`}
              className="mx-auto rounded-lg bg-white p-2"
              width={220}
              height={220}
            />

            <p className="text-[#ababab] text-xs mt-4 break-all">
              {`${window.location.origin}/order/${qrTable.id}`}
            </p>

            <button
              onClick={() => setQrTable(null)}
              className="w-full mt-5 py-2 rounded-lg bg-[#383838] text-white font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </section>
  );
};

export default Tables;
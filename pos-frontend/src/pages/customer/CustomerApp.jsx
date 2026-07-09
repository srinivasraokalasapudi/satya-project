import React, { useEffect, useState } from "react";
import { Routes, Route, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getTablePublic, getCustomerSelfMe } from "../../https";
import { setDiner, removeDiner } from "../../redux/slices/dinerSlice";
import CustomerAuth from "./CustomerAuth";
import CustomerMenu from "./CustomerMenu";
import OrderConfirmation from "./OrderConfirmation";

const TableGate = ({ children }) => {
  const { tableId } = useParams();
  const dispatch = useDispatch();
  const diner = useSelector((state) => state.diner);

  const [table, setTable] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | invalid

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const { data } = await getTablePublic(tableId);
        if (cancelled) return;
        setTable(data.data);
      } catch (error) {
        if (!cancelled) setStatus("invalid");
        return;
      }

      try {
        const { data } = await getCustomerSelfMe();
        if (!cancelled) dispatch(setDiner(data.data));
      } catch (error) {
        if (!cancelled) {
          localStorage.removeItem("customerAccessToken");
          dispatch(removeDiner());
        }
      } finally {
        if (!cancelled) setStatus("ready");
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [tableId, dispatch]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#1f1f1f] flex items-center justify-center text-white text-lg">
        Loading...
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="min-h-screen bg-[#1f1f1f] flex items-center justify-center text-white text-lg px-6 text-center">
        This table link looks invalid. Please ask a staff member for help.
      </div>
    );
  }

  if (!diner.isAuth) {
    return <CustomerAuth tableNo={table?.tableNo} />;
  }

  return children(table);
};

const CustomerApp = () => {
  return (
    <Routes>
      <Route
        path="/:tableId"
        element={
          <TableGate>
            {(table) => <CustomerMenu tableId={table._id} tableNo={table.tableNo} />}
          </TableGate>
        }
      />
      <Route path="/:tableId/confirmation" element={<OrderConfirmation />} />
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-[#1f1f1f] flex items-center justify-center text-white">
            Scan the QR code on your table to order.
          </div>
        }
      />
    </Routes>
  );
};

export default CustomerApp;

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { enqueueSnackbar } from "notistack";
import { VASU as addOrderRedux } from "../../redux/slices/orderSlice";

import {
  getTotalPrice,
  removeAllItems,
} from "../../redux/slices/cartSlice";
import { removeCustomer, setOrderStaff } from "../../redux/slices/customerSlice";

import {
  addOrder,
  createOrderRazorpay,
  verifyPaymentRazorpay,
  updateTable,
  getStaff,
} from "../../https";

import Invoice from "../invoice/Invoice";
import ConfirmDialog from "../shared/ConfirmDialog";
import { FaWhatsapp } from "react-icons/fa";
import { MdOutlineQrCode2, MdOutlineClose } from "react-icons/md";
import {
  getWhatsAppReceiptUrl,
  buildUpiPaymentUrl,
  getUpiQrCodeUrl,
  isUpiDemoVpa,
} from "../../utils";

function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

const Bill = () => {
  const dispatch = useDispatch();

  const customerData = useSelector((state) => state.customer);
  const cartData = useSelector((state) => state.cart);
  const total = useSelector(getTotalPrice);

  const taxRate = 5.25;
  const tax = (total * taxRate) / 100;
  const totalPriceWithTax = total + tax;

  const [paymentMethod, setPaymentMethod] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const [showWhatsAppPrompt, setShowWhatsAppPrompt] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [pendingUpiOrderData, setPendingUpiOrderData] = useState(null);

  // ---------------- STAFF ----------------

  const { data: staffRes } = useQuery({
    queryKey: ["staff-list", "active"],
    queryFn: () => getStaff({ status: "Active" }),
  });

  const staffOptions = staffRes?.data?.data || [];

  const handleSelectStaff = (e) => {
    const staffId = e.target.value;

    if (!staffId) return;

    const selected = staffOptions.find((member) => member._id === staffId);

    if (!selected) return;

    dispatch(
      setOrderStaff({
        id: selected._id,
        name: selected.name,
        role: selected.role,
      })
    );
  };

  // ---------------- TABLE UPDATE ----------------

  const tableMutation = useMutation({
    mutationFn: updateTable,

    onSuccess: () => {
      dispatch(removeCustomer());
      dispatch(removeAllItems());
    },

    onError: (error) => {
      console.log(error);
    },
  });

  // ---------------- ORDER ----------------

  const orderMutation = useMutation({
    mutationFn: addOrder,

    onSuccess: (res) => {
  const data = res.data.data;

  // Save order in Redux for dashboard
  dispatch(
    addOrderRedux({
      id: data._id,
      total: data.bills.totalWithTax,
      status: data.orderStatus,
    })
  );

  setOrderInfo(data);

  tableMutation.mutate({
    tableId: data.table,
    orderId: data._id,
    status: "Booked",
  });

  enqueueSnackbar("Order Placed Successfully!", {
    variant: "success",
  });

  setShowInvoice(true);

  // Payment (Cash confirmed on the spot, Online verified by Razorpay
  // before this callback ever runs) is done at this point, so ask the
  // waiter whether to send the receipt on WhatsApp rather than opening
  // it silently.
  setShowWhatsAppPrompt(true);
},

      onError: (error) => {
    console.log("Order Error:", error);
    console.log("Response:", error.response);
    console.log("Data:", error.response?.data);

    enqueueSnackbar(
      error?.response?.data?.message || "Failed to place order",
      {
        variant: "error",
      }
    );
  },
});

  // ---------------- PLACE ORDER ----------------

  const handlePlaceOrder = async () => {
    if (!customerData.table?.tableId) {
      enqueueSnackbar("Please select a table first!", {
        variant: "warning",
      });
      return;
    }

    if (!customerData.customerName) {
      enqueueSnackbar("Please enter customer details!", {
        variant: "warning",
      });
      return;
    }

    if (!customerData.staff?.id) {
      enqueueSnackbar("Please select the staff taking this order!", {
        variant: "warning",
      });
      return;
    }

    if (cartData.length === 0) {
      enqueueSnackbar("Cart is empty!", {
        variant: "warning",
      });
      return;
    }

    if (!paymentMethod) {
      enqueueSnackbar("Please select a payment method!", {
        variant: "warning",
      });
      return;
    }

    const orderData = {
      customerDetails: {
        name: customerData.customerName,
        phone: customerData.customerPhone,
        guests: customerData.guests,
      },

      orderStatus: "In Progress",

      bills: {
        total,
        tax,
        totalWithTax: totalPriceWithTax,
      },

      items: cartData,
      table: customerData.table.tableId,
      staff: customerData.staff?.id,
      paymentMethod,
    };

    // ---------------- CASH ----------------

    if (paymentMethod === "Cash") {
      console.log("Order Data:", orderData);
      orderMutation.mutate(orderData);
      return;
    }

    // ---------------- UPI ----------------
    // UPI is settled directly between the customer's UPI app and the
    // merchant VPA (no gateway round-trip like Razorpay), so we show a
    // QR/deep-link modal and let the waiter confirm once payment lands.
    if (paymentMethod === "UPI") {
      setPendingUpiOrderData(orderData);
      setShowUpiModal(true);
      return;
    }

    // ---------------- ONLINE ----------------

    try {
      const loaded = await loadScript(
        "https://checkout.razorpay.com/v1/checkout.js"
      );

      if (!loaded) {
        enqueueSnackbar("Unable to load Razorpay.", {
          variant: "error",
        });
        return;
      }

      const { data } = await createOrderRazorpay({
        amount: totalPriceWithTax.toFixed(2),
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,

        amount: data.order.amount,

        currency: data.order.currency,

        order_id: data.order.id,

        name: "VASU 5-Star Hotel",

        description: "Restaurant POS Payment",

        handler: async (response) => {
          try {
            await verifyPaymentRazorpay({
              ...response,
              amount: totalPriceWithTax.toFixed(2),
              currency: data.order.currency,
              method: "Online",
              email: customerData.customerEmail,
              contact: customerData.customerPhone,
            });

            orderMutation.mutate({
              ...orderData,

              paymentData: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
              },
            });
          } catch (error) {
            console.log(error);

            enqueueSnackbar("Payment verification failed!", {
              variant: "error",
            });
          }
        },

        theme: {
          color: "#025cca",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.open();
    } catch (error) {
      console.log(error);

      enqueueSnackbar(
        error?.response?.data?.message ||
          error?.message ||
          "Payment Failed!",
        {
          variant: "error",
        }
      );
    }
  };

  // ---------------- WHATSAPP RECEIPT PROMPT ----------------

  const handleConfirmSendWhatsApp = () => {
    setShowWhatsAppPrompt(false);

    const whatsappUrl = getWhatsAppReceiptUrl(orderInfo);

    if (!whatsappUrl) {
      enqueueSnackbar("No valid phone number on this order to send a WhatsApp receipt.", {
        variant: "warning",
      });
      return;
    }

    // Opened from this button's own click, so it's a direct user gesture
    // and won't get caught by popup blockers.
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleDeclineSendWhatsApp = () => {
    setShowWhatsAppPrompt(false);
  };

  // ---------------- UPI PAYMENT ----------------

  const upiPaymentUrl = buildUpiPaymentUrl({
    amount: totalPriceWithTax,
    note: `Table ${customerData.table?.tableNo ?? ""} - VASU 5-Star Hotel`,
    refId: customerData.orderId,
  });

  const upiQrCodeUrl = getUpiQrCodeUrl(upiPaymentUrl);

  const handleCancelUpi = () => {
    setShowUpiModal(false);
    setPendingUpiOrderData(null);
  };

  // Waiter taps this once the customer's UPI app shows the payment as
  // successful (there's no gateway webhook for a direct VPA payment).
  const handleConfirmUpiReceived = () => {
    if (!pendingUpiOrderData) return;

    orderMutation.mutate(pendingUpiOrderData);
    setShowUpiModal(false);
    setPendingUpiOrderData(null);
  };

  return (
    <>
      <div className="sticky bottom-0 bg-[#1a1a1a] border-t border-[#2a2a2a] px-5 py-4">
        <div className="mb-4">
          <label className="text-[#ababab] text-sm mb-1 block">
            Staff taking this order
          </label>

          <select
            value={customerData.staff?.id || ""}
            onChange={handleSelectStaff}
            className="w-full bg-[#2a2a2a] text-white rounded-lg px-3 py-2 outline-none"
          >
            <option value="">Select staff</option>

            {staffOptions.map((member) => (
              <option key={member._id} value={member._id}>
                {member.name} ({member.role})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-[#ababab]">
              Items ({cartData.length})
            </span>

            <span className="text-white font-semibold">
              ₹{total.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-[#ababab]">
              Tax (5.25%)
            </span>

            <span className="text-white font-semibold">
              ₹{tax.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-lg font-bold">
            <span className="text-white">
              Total
            </span>

            <span className="text-[#f6b100]">
              ₹{totalPriceWithTax.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          <button
            onClick={() => setPaymentMethod("Cash")}
            className={`rounded-lg py-3 font-semibold ${
              paymentMethod === "Cash"
                ? "bg-[#025cca] text-white"
                : "bg-[#2a2a2a] text-[#ababab]"
            }`}
          >
            Cash
          </button>

          <button
            onClick={() => setPaymentMethod("UPI")}
            className={`rounded-lg py-3 font-semibold flex items-center justify-center gap-1.5 ${
              paymentMethod === "UPI"
                ? "bg-[#025cca] text-white"
                : "bg-[#2a2a2a] text-[#ababab]"
            }`}
          >
            <MdOutlineQrCode2 size={18} />
            UPI
          </button>

          <button
            onClick={() => setPaymentMethod("Online")}
            className={`rounded-lg py-3 font-semibold ${
              paymentMethod === "Online"
                ? "bg-[#025cca] text-white"
                : "bg-[#2a2a2a] text-[#ababab]"
            }`}
          >
            Online
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <button className="bg-[#3a3a3a] text-white rounded-lg py-3 font-semibold">
            Print Receipt
          </button>

          <button
            onClick={handlePlaceOrder}
            disabled={orderMutation.isPending}
            className="bg-[#f6b100] text-black rounded-lg py-3 font-bold"
          >
            {orderMutation.isPending ? "Placing..." : "Place Order"}
          </button>
        </div>
      </div>

      {showInvoice && (
        <Invoice
          orderInfo={orderInfo}
          setShowInvoice={setShowInvoice}
        />
      )}

      <ConfirmDialog
        isOpen={showWhatsAppPrompt}
        icon={<FaWhatsapp />}
        title="Send receipt via WhatsApp?"
        message={
          orderInfo?.customerDetails?.phone
            ? `Send this order's receipt to ${orderInfo.customerDetails.name} at ${orderInfo.customerDetails.phone}.`
            : "Send this order's receipt over WhatsApp."
        }
        confirmText="Send"
        cancelText="Not now"
        onConfirm={handleConfirmSendWhatsApp}
        onCancel={handleDeclineSendWhatsApp}
      />

      <AnimatePresence>
        {showUpiModal && (
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
              className="bg-[#1a1a1a] rounded-xl shadow-lg w-full max-w-sm p-6 text-center relative"
            >
              <button
                onClick={handleCancelUpi}
                className="absolute top-3 right-3 text-[#ababab] hover:text-white"
              >
                <MdOutlineClose size={22} />
              </button>

              <h3 className="text-white text-lg font-semibold">
                Scan to Pay with UPI
              </h3>

              <p className="text-[#ababab] text-sm mt-1">
                GPay, PhonePe, Paytm or any UPI app
              </p>

              {isUpiDemoVpa && (
                <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-xs rounded-lg px-3 py-2 mt-3 text-left">
                  This QR uses a placeholder UPI ID and will show "Invalid
                  QR code" when scanned. Set{" "}
                  <span className="font-mono">VITE_UPI_ID</span> to your
                  real business UPI ID in the deployment's environment
                  variables to make this scannable.
                </div>
              )}

              <div className="bg-white rounded-lg p-3 mx-auto mt-4 w-fit">
                <img
                  src={upiQrCodeUrl}
                  alt="UPI QR Code"
                  width={220}
                  height={220}
                  className="block"
                />
              </div>

              <div className="text-[#f6b100] text-2xl font-bold mt-4">
                ₹{totalPriceWithTax.toFixed(2)}
              </div>

              <a
                href={upiPaymentUrl}
                className="block mt-4 bg-[#2a2a2a] text-white rounded-lg py-2.5 font-semibold text-sm hover:bg-[#333]"
              >
                Open in UPI App
              </a>

              <p className="text-[#7a7a7a] text-xs mt-3">
                Once the customer completes the payment, confirm below to
                place the order.
              </p>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleCancelUpi}
                  className="flex-1 py-2.5 rounded-lg font-semibold text-sm bg-[#2a2a2a] text-[#ababab] hover:bg-[#333]"
                >
                  Cancel
                </button>

                <button
                  onClick={handleConfirmUpiReceived}
                  disabled={orderMutation.isPending}
                  className="flex-1 py-2.5 rounded-lg font-semibold text-sm bg-green-600 text-white hover:bg-green-700"
                >
                  {orderMutation.isPending
                    ? "Placing..."
                    : "Payment Received"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Bill;
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMutation, useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { satya as addOrderRedux } from "../../redux/slices/orderSlice";

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
import { MdOutlineQrCode2 } from "react-icons/md";
import { getWhatsAppReceiptUrl } from "../../utils";

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

    // ---------------- UPI / ONLINE ----------------
    // Both go through Razorpay (not a raw upi://pay deep link straight to
    // the merchant VPA). A direct-to-VPA link settles peer-to-peer between
    // the customer's UPI app and the bank - our server/Razorpay never
    // hears about it, so nothing could ever auto-confirm it, no matter
    // what the frontend does. Routing through Razorpay's checkout means
    // Razorpay's SDK detects the payment itself (polling + the UPI app's
    // return) and fires `handler` the moment it's captured, which then
    // verifies the payment and places the order automatically - no
    // "Payment Received" button needed.
    if (paymentMethod === "UPI" || paymentMethod === "Online") {
      await openRazorpayCheckout(orderData, {
        upiOnly: paymentMethod === "UPI",
      });
      return;
    }
  };

  const openRazorpayCheckout = async (orderData, { upiOnly }) => {
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

        name: "Satya 5-Star Hotel",

        description: "Restaurant POS Payment",

        // Fires the instant Razorpay confirms the payment (including a
        // scanned UPI QR / intent payment) - this is what makes the order
        // get placed automatically, with no manual confirmation step.
        handler: async (response) => {
          try {
            await verifyPaymentRazorpay({
              ...response,
              amount: totalPriceWithTax.toFixed(2),
              currency: data.order.currency,
              method: upiOnly ? "UPI" : "Online",
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

        // Razorpay's checkout only shows the payment methods enabled on
        // the merchant's dashboard, in whatever order it decides. That's
        // why UPI can silently disappear from "Payment Options" even
        // though it's a standard method - explicitly pinning a UPI block
        // here forces it to render. When the waiter picked the "UPI"
        // button specifically, we restrict the checkout to just the UPI
        // block (QR/collect/intent) so it opens straight to the QR
        // screen instead of the full payment-method list.
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay via UPI",
                instruments: [{ method: "upi" }],
              },
            },
            sequence: upiOnly ? ["block.upi"] : ["block.upi", "block.other"],
            preferences: {
              show_default_blocks: !upiOnly,
            },
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response) => {
        console.log(response.error);
        enqueueSnackbar(
          response.error?.description || "Payment failed!",
          { variant: "error" }
        );
      });

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

    </>
  );
};

export default Bill;
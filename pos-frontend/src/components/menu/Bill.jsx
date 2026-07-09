import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { satya as addOrderRedux } from "../../redux/slices/orderSlice";

import {
  getTotalPrice,
  removeAllItems,
} from "../../redux/slices/cartSlice";
import { removeCustomer } from "../../redux/slices/customerSlice";

import {
  addOrder,
  createOrderRazorpay,
  verifyPaymentRazorpay,
  updateTable,
} from "../../https";

import Invoice from "../invoice/Invoice";
import ConfirmDialog from "../shared/ConfirmDialog";
import { FaWhatsapp } from "react-icons/fa";
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
      paymentMethod,
      staff: customerData.staff?.id,
    };

    // ---------------- CASH ----------------

    if (paymentMethod === "Cash") {
      console.log("Order Data:", orderData);
      orderMutation.mutate(orderData);
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

        name: "Satya 5-Star Hotel",

        description: "Restaurant POS Payment",

        handler: async (response) => {
          try {
            await verifyPaymentRazorpay(response);

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

  return (
    <>
      <div className="sticky bottom-0 bg-[#1a1a1a] border-t border-[#2a2a2a] px-5 py-4">
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

        <div className="grid grid-cols-2 gap-3 mt-5">
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
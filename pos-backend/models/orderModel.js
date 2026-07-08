const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer"
},  
    customerDetails: {
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      guests: {
        type: Number,
        required: true,
      },
    },

    orderStatus: {
      type: String,
      enum: ["In Progress", "Ready", "Completed"],
      default: "In Progress",
      required: true,
    },

    orderDate: {
      type: Date,
      default: Date.now,
    },

    bills: {
      total: {
        type: Number,
        required: true,
      },
      tax: {
        type: Number,
        required: true,
      },
      totalWithTax: {
        type: Number,
        required: true,
      },
    },

    items: {
      type: [],
      default: [],
    },

    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
    },

    paymentMethod: {
      type: String,
    },

    paymentData: {
      razorpay_order_id: String,
      razorpay_payment_id: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
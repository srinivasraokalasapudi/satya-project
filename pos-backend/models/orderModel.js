const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer"
},

    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
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

    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },

    // Snapshot of the staff member at the time the order was taken, so
    // reports keep showing the right name/role even if the Staff record
    // is edited or removed later (same pattern as customerDetails above).
    staffDetails: {
      name: {
        type: String,
      },
      role: {
        type: String,
      },
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
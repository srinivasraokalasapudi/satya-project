const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Only present once a customer has signed up for self-service
    // ordering (scanning the QR code at their table). Walk-in
    // customers whose details were taken by a waiter never get one,
    // and can "claim" their existing record later by signing up with
    // the same phone number.
    password: {
      type: String,
      required: false,
      select: false,
    },

    email: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    totalOrders: {
      type: Number,
      default: 0,
    },

    totalSpent: {
      type: Number,
      default: 0,
    },

    lastOrderDate: {
      type: Date,
    },

    loyaltyPoints: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Regular", "VIP"],
      default: "Regular",
    },
  },
  {
    timestamps: true,
  }
);

customerSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model("Customer", customerSchema);
const mongoose = require("mongoose");

const statsSchema = new mongoose.Schema(
  {
    totalEarnings: {
      type: Number,
      default: 0,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Stats", statsSchema);
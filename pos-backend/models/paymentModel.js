const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    paymentId: { type: String, unique: true, sparse: true },
    orderId: String,
    amount: Number,
    currency: String,
    status: String,
    method: String,
    email: String,
    contact: String,
    createdAt: Date,
    // Set once this payment has been used to create a restaurant Order,
    // so the same successful Razorpay payment can't be replayed to
    // create a second, unpaid-for order.
    consumedByOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        default: null,
    },
})

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
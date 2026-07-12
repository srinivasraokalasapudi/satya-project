const Razorpay = require("razorpay");
const config = require("../config/config");
const crypto = require("crypto");
const createHttpError = require("http-errors");
const Payment = require("../models/paymentModel");

const razorpay = new Razorpay({
  key_id: config.razorpayKeyId,
  key_secret: config.razorpaySecretKey,
});

// =======================================
// Create Razorpay Order
// =======================================
// req.body.amount has already been validated (positive, finite, under
// the configured ceiling) by validateCreateOrderAmount before this runs.
const createOrder = async (req, res, next) => {
  try {
    const amount = req.body.amount;

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    // Razorpay's own error payload can be useful for support/debugging,
    // but a stack trace and internal error object have no business
    // being sent to the client - log server-side, return a generic
    // message, and let the global error handler decide what (if
    // anything) to expose based on environment.
    console.error("Create Order Error:", err.message);
    next(createHttpError(502, "Unable to start payment. Please try again."));
  }
};

// =======================================
// Verify Payment
// =======================================
const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      method,
      email,
      contact,
    } = req.body;

    const expectedSignature = crypto
      .createHmac("sha256", config.razorpaySecretKey)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    // Constant-time comparison so a mismatched signature can't be
    // inferred from response timing. Guard the length check first since
    // timingSafeEqual throws on mismatched buffer lengths.
    const signaturesMatch =
      expectedSignature.length === razorpay_signature?.length &&
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(razorpay_signature)
      );

    if (!signaturesMatch) {
      return next(createHttpError(400, "Payment verification failed!"));
    }

    // Don't trust the amount/currency the client says it paid - ask
    // Razorpay directly what this order actually settled for, and
    // record that authoritative figure. This is what later lets
    // addOrder cross-check "does the order total match what was
    // actually paid?" instead of trusting the client twice.
    const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);

    if (razorpayOrder.status !== "paid") {
      return next(
        createHttpError(400, "Payment has not been completed for this order.")
      );
    }

    const existingPayment = await Payment.findOne({
      paymentId: razorpay_payment_id,
    });

    if (!existingPayment) {
      await Payment.create({
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        amount: razorpayOrder.amount_paid / 100,
        currency: razorpayOrder.currency,
        status: "captured",
        method: method || "Online",
        email,
        contact,
        createdAt: new Date(),
      });
    }

    res.json({ success: true, message: "Payment verified successfully!" });
  } catch (error) {
    // A duplicate-key error here means two requests raced to record the
    // same paymentId - that's fine, the payment is still verified.
    if (error?.code === 11000) {
      return res.json({ success: true, message: "Payment verified successfully!" });
    }
    next(error);
  }
};

// =======================================
// Razorpay Webhook
// =======================================
const webHookVerification = async (req, res, next) => {
  try {
    const secret = config.razorpyWebhookSecret;
    const signature = req.headers["x-razorpay-signature"];

    if (!secret || !signature || !req.rawBody) {
      return next(createHttpError(400, "Invalid webhook request."));
    }

    // Verify against the exact raw bytes Razorpay sent (captured in
    // app.js), not a re-serialized copy of req.body - re-serializing
    // can silently change the byte sequence and break verification.
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(req.rawBody)
      .digest("hex");

    const signaturesMatch =
      expectedSignature.length === signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(signature)
      );

    if (!signaturesMatch) {
      return next(createHttpError(400, "Invalid webhook signature."));
    }

    if (req.body.event === "payment.captured") {
      const payment = req.body.payload.payment.entity;

      const existingPayment = await Payment.findOne({ paymentId: payment.id });

      if (!existingPayment) {
        await Payment.create({
          paymentId: payment.id,
          orderId: payment.order_id,
          amount: payment.amount / 100,
          currency: payment.currency,
          status: payment.status,
          method: payment.method,
          email: payment.email,
          contact: payment.contact,
          createdAt: new Date(payment.created_at * 1000),
        });
      }
    }

    res.json({ success: true });
  } catch (error) {
    if (error?.code === 11000) {
      return res.json({ success: true });
    }
    next(error);
  }
};

module.exports = { createOrder, verifyPayment, webHookVerification };

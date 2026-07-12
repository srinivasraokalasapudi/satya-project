const express = require("express");
const router = express.Router();

const { isVerifiedUser } = require("../middlewares/tokenVerification");
const { createRateLimiter } = require("../middlewares/rateLimiter");
const {
  validateCreateOrderAmount,
  validateVerifyPaymentPayload,
} = require("../validation/paymentValidation");
const {
  createOrder,
  verifyPayment,
  webHookVerification,
} = require("../controllers/paymentController");

// A normal staff-taken order calls these once each, so a generous but
// bounded window is enough to allow retries after a flaky network
// without leaving the endpoint open to being hammered.
const paymentRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20,
  message: "Too many payment requests. Please wait a moment and try again.",
});

router
  .route("/create-order")
  .post(isVerifiedUser, paymentRateLimiter, validateCreateOrderAmount, createOrder);

router
  .route("/verify-payment")
  .post(isVerifiedUser, paymentRateLimiter, validateVerifyPaymentPayload, verifyPayment);

// Called by Razorpay's servers, not end users - no per-user rate limit
// or staff auth applies here; the HMAC signature check inside the
// controller is what authenticates the caller.
router.route("/webhook-verification").post(webHookVerification);

module.exports = router;

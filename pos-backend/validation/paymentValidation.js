// Guardrails for the two client-facing payment endpoints. These run
// before the controllers and reject obviously bad/dangerous input
// early, with a clear 400 instead of an opaque failure further down.

// A single order at this restaurant realistically won't run past this;
// it exists purely as a sanity ceiling against typos or someone poking
// the API directly with a junk amount (adjust if your menu/business
// needs a higher ceiling).
const MAX_ORDER_AMOUNT = 100000; // ₹1,00,000

exports.validateCreateOrderAmount = (req, res, next) => {
  const amount = Number(req.body.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "A valid, positive amount is required.",
    });
  }

  if (amount > MAX_ORDER_AMOUNT) {
    return res.status(400).json({
      success: false,
      message: `Amount exceeds the maximum allowed (₹${MAX_ORDER_AMOUNT}).`,
    });
  }

  // Normalize so downstream code always sees a clean number.
  req.body.amount = amount;
  next();
};

exports.validateVerifyPaymentPayload = (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({
      success: false,
      message: "Missing payment verification fields.",
    });
  }

  next();
};

exports.MAX_ORDER_AMOUNT = MAX_ORDER_AMOUNT;

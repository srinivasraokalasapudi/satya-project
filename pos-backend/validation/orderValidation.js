// Guards against a tampered or simply buggy bill: the client sends the
// cart contents and the computed total together, so we cross-check that
// the numbers are internally consistent before trusting them enough to
// create a paid order from them.
//
// Note: this catches mismatches between what the client *claims* the
// items cost and what the client *claims* the total is - it can't catch
// a client that lies consistently about both (e.g. sends a fabricated
// low price for a real dish), because there's currently no backend menu
// price list to check against. Closing that gap fully would mean
// pricing every order item from a server-side menu source of truth
// instead of trusting client-supplied prices at all.

const TOLERANCE = 1; // ₹1, to absorb floating point / rounding noise

const isFiniteNonNegative = (n) => Number.isFinite(n) && n >= 0;

exports.validateOrderPayload = (req, res, next) => {
  const { bills, items } = req.body;

  if (!bills || !items || !items.length) {
    // Presence is already checked by the controllers; nothing more to
    // validate here if they're missing.
    return next();
  }

  const total = Number(bills.total);
  const tax = Number(bills.tax);
  const totalWithTax = Number(bills.totalWithTax);

  if (![total, tax, totalWithTax].every(isFiniteNonNegative)) {
    return res.status(400).json({
      success: false,
      message: "Bill amounts must be valid, non-negative numbers.",
    });
  }

  if (Math.abs(total + tax - totalWithTax) > TOLERANCE) {
    return res.status(400).json({
      success: false,
      message: "Bill total, tax and grand total don't add up.",
    });
  }

  let computedTotal = 0;

  for (const item of items) {
    const quantity = Number(item.quantity);
    const pricePerQuantity = Number(item.pricePerQuantity);
    const price = Number(item.price);

    if (
      !item.name ||
      !Number.isInteger(quantity) ||
      quantity <= 0 ||
      quantity > 999 ||
      !isFiniteNonNegative(pricePerQuantity) ||
      !isFiniteNonNegative(price)
    ) {
      return res.status(400).json({
        success: false,
        message: `Invalid item in order: ${item?.name || "unnamed item"}.`,
      });
    }

    if (Math.abs(quantity * pricePerQuantity - price) > TOLERANCE) {
      return res.status(400).json({
        success: false,
        message: `Item price doesn't match quantity for ${item.name}.`,
      });
    }

    computedTotal += price;
  }

  if (Math.abs(computedTotal - total) > TOLERANCE) {
    return res.status(400).json({
      success: false,
      message: "Bill total doesn't match the sum of the order items.",
    });
  }

  next();
};

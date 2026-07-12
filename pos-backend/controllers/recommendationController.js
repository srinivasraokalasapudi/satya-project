const { buildRecommendations } = require("../utils/recommendationEngine");

// GET /api/recommendation?cart=Item%20One,Item%20Two
// Returns a ranked list of dish names the diner is likely to want next,
// based on their own order history plus what tends to get ordered
// alongside whatever is already in their cart.
exports.getRecommendations = async (req, res, next) => {
  try {
    const cartNames = (req.query.cart || "")
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);

    const recommendations = await buildRecommendations({
      customerId: req.customer?._id || null,
      cartNames,
    });

    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};

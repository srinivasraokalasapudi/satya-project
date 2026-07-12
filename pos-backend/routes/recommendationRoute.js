const express = require("express");

const { getRecommendations } = require("../controllers/recommendationController");
const { isVerifiedCustomer } = require("../middlewares/tokenVerification");

const router = express.Router();

// Recommendations are shown on the diner self-order screen, so they
// ride on the same customer session as /api/order/self and /api/order/mine.
router.get("/", isVerifiedCustomer, getRecommendations);

module.exports = router;

const express = require("express");

const {
  addOrder,
  getOrderById,
  getOrders,
  updateOrder,
  deleteOrder,
  createSelfOrder,
  getMyOrders,
} = require("../controllers/orderController");

const { isVerifiedUser, isVerifiedCustomer } = require("../middlewares/tokenVerification");
const { isAdmin } = require("../middlewares/roleVerification");
const { validateOrderPayload } = require("../validation/orderValidation");

const router = express.Router();

// Taking, viewing and updating orders is normal day-to-day staff work,
// so any logged-in employee can do this - not just Admins.
router.post("/", isVerifiedUser, validateOrderPayload, addOrder);
router.get("/", isVerifiedUser, getOrders);

// Self-service (diner logged in via QR code at their table). Declared
// before "/:id" so "mine"/"self" are never swallowed as an order id.
router.post("/self", isVerifiedCustomer, validateOrderPayload, createSelfOrder);
router.get("/mine", isVerifiedCustomer, getMyOrders);

router.get("/:id", isVerifiedUser, getOrderById);
router.put("/:id", isVerifiedUser, updateOrder);
// Deleting an order record entirely is destructive, so that stays Admin-only.
router.delete("/:id", isVerifiedUser, isAdmin, deleteOrder);

module.exports = router;

const express = require("express");

const {
  addOrder,
  getOrderById,
  getOrders,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderController");

const { isVerifiedUser } = require("../middlewares/tokenVerification");
const { isAdmin } = require("../middlewares/roleVerification");

const router = express.Router();

// Taking, viewing and updating orders is normal day-to-day staff work,
// so any logged-in employee can do this - not just Admins.
router.post("/", isVerifiedUser, addOrder);
router.get("/", isVerifiedUser, getOrders);
router.get("/:id", isVerifiedUser, getOrderById);
router.put("/:id", isVerifiedUser, updateOrder);
// Deleting an order record entirely is destructive, so that stays Admin-only.
router.delete("/:id", isVerifiedUser, isAdmin, deleteOrder);

module.exports = router;

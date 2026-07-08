const express = require("express");

const {
  addOrder,
  getOrderById,
  getOrders,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderController");

const { isVerifiedUser, restrictTo } = require("../middlewares/tokenVerification");

const router = express.Router();

// All staff (Admin or otherwise) can take and view orders, and move them
// through their statuses (In Progress -> Ready -> Completed). Deleting an
// order outright is an owner-only action.
router.post("/", isVerifiedUser, addOrder);
router.get("/", isVerifiedUser, getOrders);
router.get("/:id", isVerifiedUser, getOrderById);
router.put("/:id", isVerifiedUser, updateOrder);
router.delete("/:id", isVerifiedUser, restrictTo("Admin"), deleteOrder);

module.exports = router;

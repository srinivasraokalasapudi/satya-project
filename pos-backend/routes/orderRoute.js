const express = require("express");

const {
  addOrder,
  getOrderById,
  getOrders,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderController");

const router = express.Router();

router.post("/", addOrder);
router.get("/", getOrders);
router.get("/:id", getOrderById);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);

module.exports = router;
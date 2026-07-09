const express = require("express");
const router = express.Router();

const {
  addTable,
  getTables,
  getTableById,
  updateTable,
  resetTable,
} = require("../controllers/tableController");

const { isVerifiedUser } = require("../middlewares/tokenVerification");

router.post("/", isVerifiedUser, addTable);

router.get("/", isVerifiedUser, getTables);

// Public - QR code landing page looks up the table before the diner
// has logged in. Must be declared before any other "/:id"-shaped
// staff route so it isn't accidentally shadowed.
router.get("/public/:id", getTableById);

router.put("/:id", isVerifiedUser, updateTable);

// Reset Table
router.put("/reset/:tableId", isVerifiedUser, resetTable);

module.exports = router;
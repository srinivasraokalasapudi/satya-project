const express = require("express");
const router = express.Router();

const {
  addTable,
  getTables,
  updateTable,
  resetTable,
} = require("../controllers/tableController");

const { isVerifiedUser } = require("../middlewares/tokenVerification");

router.post("/", isVerifiedUser, addTable);

router.get("/", isVerifiedUser, getTables);

router.put("/:id", isVerifiedUser, updateTable);

// Reset Table
router.put("/reset/:tableId", isVerifiedUser, resetTable);

module.exports = router;
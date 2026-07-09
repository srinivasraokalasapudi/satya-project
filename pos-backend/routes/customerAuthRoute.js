const express = require("express");
const router = express.Router();

const {
  registerCustomer,
  loginCustomer,
  logoutCustomer,
  getMe,
} = require("../controllers/customerAuthController");

const { isVerifiedCustomer } = require("../middlewares/tokenVerification");

// Public - anyone scanning the QR code can sign up / log in.
router.post("/register", registerCustomer);
router.post("/login", loginCustomer);
router.post("/logout", logoutCustomer);

// Requires the diner to be logged in.
router.get("/me", isVerifiedCustomer, getMe);

module.exports = router;

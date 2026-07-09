const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
} = require("../controllers/dashboardController");

const { isVerifiedUser } = require("../middlewares/tokenVerification");

router.get("/", isVerifiedUser, getDashboardStats);

module.exports = router;

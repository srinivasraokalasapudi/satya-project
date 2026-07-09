const express = require("express");
const { register, login, getUserData, logout } = require("../controllers/userController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");
const { isAdmin } = require("../middlewares/roleVerification");
const router = express.Router();


// Authentication Routes
// Only an Admin can create new login accounts (e.g. for new staff members)
router.route("/register").post(isVerifiedUser, isAdmin, register);
router.route("/login").post(login);
router.route("/logout").post(logout)

router.route("/").get(isVerifiedUser , getUserData);

module.exports = router;

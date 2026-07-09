const express = require("express");
const { register, login, getUserData, logout } = require("../controllers/userController");
const { isVerifiedUser, attachUserIfPresent } = require("../middlewares/tokenVerification");
const router = express.Router();


// Authentication Routes
// Public sign-up: anyone can create an account, but the controller
// forces a safe "Waiter" (view-only) role unless the request comes
// from a logged-in Admin (who is trusted to set a specific role, e.g.
// when adding a staff login from the Staff Management screen).
router.route("/register").post(attachUserIfPresent, register);
router.route("/login").post(login);
router.route("/logout").post(logout)

router.route("/").get(isVerifiedUser , getUserData);

module.exports = router;

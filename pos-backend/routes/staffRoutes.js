const router = require("express").Router();
const c = require("../controllers/staffController");
const { isVerifiedUser, restrictTo } = require("../middlewares/tokenVerification");

// Every logged-in employee (Admin or Waiter/other staff) can view the
// staff list, but only the Admin (owner) can add, edit, or remove staff.
router.get("/", isVerifiedUser, c.getStaff);
router.post("/", isVerifiedUser, restrictTo("Admin"), c.createStaff);
router.put("/:id", isVerifiedUser, restrictTo("Admin"), c.updateStaff);
router.delete("/:id", isVerifiedUser, restrictTo("Admin"), c.deleteStaff);

module.exports = router;

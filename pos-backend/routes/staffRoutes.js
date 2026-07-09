const router=require("express").Router();
const c=require("../controllers/staffController");
const { validateStaff }=require("../validation/staffValidation");
const { isVerifiedUser }=require("../middlewares/tokenVerification");
const { isAdmin }=require("../middlewares/roleVerification");

// Anyone logged in can view staff & reports
router.get("/reports",isVerifiedUser,c.getStaffReports);
router.get("/",isVerifiedUser,c.getStaff);

// Only Admin can add, edit or remove staff
router.post("/",isVerifiedUser,isAdmin,validateStaff,c.createStaff);
router.put("/:id",isVerifiedUser,isAdmin,validateStaff,c.updateStaff);
router.delete("/:id",isVerifiedUser,isAdmin,c.deleteStaff);

module.exports=router;

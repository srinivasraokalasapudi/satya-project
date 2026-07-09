const router=require("express").Router();
const c=require("../controllers/staffController");
const { validateStaff }=require("../validation/staffValidation");
router.get("/reports",c.getStaffReports);
router.get("/",c.getStaff);
router.post("/",validateStaff,c.createStaff);
router.put("/:id",validateStaff,c.updateStaff);
router.delete("/:id",c.deleteStaff);
module.exports=router;

const router=require("express").Router();
const c=require("../controllers/staffController");
<<<<<<< HEAD
=======
const { validateStaff }=require("../validation/staffValidation");
>>>>>>> e5ee836 (Add staff selection on orders, staff CRUD, and staff revenue reports)
router.get("/reports",c.getStaffReports);
router.get("/",c.getStaff);
router.post("/",validateStaff,c.createStaff);
router.put("/:id",validateStaff,c.updateStaff);
router.delete("/:id",c.deleteStaff);
module.exports=router;

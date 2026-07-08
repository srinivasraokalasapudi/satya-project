const router=require("express").Router();
const c=require("../controllers/staffController");
const { validateStaff }=require("../validation/staffValidation");

router.get("/",c.getStaff);
router.get("/:id/orders",c.getStaffOrders);
router.post("/",validateStaff,c.createStaff);
router.put("/:id",c.updateStaff);
router.delete("/:id",c.deleteStaff);

module.exports=router;

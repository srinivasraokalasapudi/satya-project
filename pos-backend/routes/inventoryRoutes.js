const router=require("express").Router();
const c=require("../controllers/inventoryController");
const { isVerifiedUser }=require("../middlewares/tokenVerification");
const { isAdmin }=require("../middlewares/roleVerification");

router.get("/",isVerifiedUser,c.getInventory);
router.post("/",isVerifiedUser,isAdmin,c.createInventory);
router.put("/:id",isVerifiedUser,isAdmin,c.updateInventory);
router.delete("/:id",isVerifiedUser,isAdmin,c.deleteInventory);
module.exports=router;

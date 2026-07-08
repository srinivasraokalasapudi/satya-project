const router=require("express").Router();
const c=require("../controllers/inventoryController");
router.get("/",c.getInventory);
router.post("/",c.createInventory);
router.put("/:id",c.updateInventory);
router.delete("/:id",c.deleteInventory);
module.exports=router;

const express=require("express");
const router=express.Router();
const c=require("../controllers/settingsController");
router.get("/",c.getSettings);
router.put("/",c.updateSettings);
module.exports=router;

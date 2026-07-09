const express=require("express");
const router=express.Router();
const c=require("../controllers/settingsController");
const { isVerifiedUser }=require("../middlewares/tokenVerification");
const { isAdmin }=require("../middlewares/roleVerification");

router.get("/",isVerifiedUser,c.getSettings);
router.put("/",isVerifiedUser,isAdmin,c.updateSettings);
module.exports=router;

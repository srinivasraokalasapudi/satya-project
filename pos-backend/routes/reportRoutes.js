const express=require("express");
const router=express.Router();
const c=require("../controllers/reportController");
const { isVerifiedUser }=require("../middlewares/tokenVerification");

router.get("/dashboard",isVerifiedUser,c.getDashboardReport);
router.get("/sales",isVerifiedUser,c.getSalesReport);
router.get("/daily",isVerifiedUser,c.getDailySales);
router.get("/weekly",isVerifiedUser,c.getWeeklySales);
router.get("/monthly",isVerifiedUser,c.getMonthlySales);
router.get("/top-items",isVerifiedUser,c.getTopSellingItems);
router.get("/payments",isVerifiedUser,c.getPaymentReport);
module.exports=router;

const express=require("express");

const router=express.Router();

const{

getCustomers,

getCustomer,

createCustomer,

updateCustomer,

deleteCustomer

}=require("../controllers/customerController");

const { isVerifiedUser }=require("../middlewares/tokenVerification");
const { isAdmin }=require("../middlewares/roleVerification");

router.get("/",isVerifiedUser,getCustomers);

router.get("/:id",isVerifiedUser,getCustomer);

router.post("/",isVerifiedUser,isAdmin,createCustomer);

router.put("/:id",isVerifiedUser,isAdmin,updateCustomer);

router.delete("/:id",isVerifiedUser,isAdmin,deleteCustomer);

module.exports=router;

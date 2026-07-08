exports.validateInventory=(req,res,next)=>{
 const {name,category,quantity,price}=req.body;
 if(!name||!category){
   return res.status(400).json({success:false,message:"Name and category are required"});
 }
 if(quantity!=null && quantity<0){
   return res.status(400).json({success:false,message:"Quantity cannot be negative"});
 }
 if(price!=null && price<0){
   return res.status(400).json({success:false,message:"Price cannot be negative"});
 }
 next();
};

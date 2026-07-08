exports.validateStaff=(req,res,next)=>{
 const {name,email,role}=req.body;
 if(!name||!email||!role){
   return res.status(400).json({success:false,message:"Name, email and role are required"});
 }
 const emailRegex=/\S+@\S+\.\S+/;
 if(!emailRegex.test(email)){
   return res.status(400).json({success:false,message:"Invalid email"});
 }
 next();
};

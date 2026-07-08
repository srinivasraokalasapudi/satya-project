const config=require("../config/config");

module.exports=(err,req,res,next)=>{
  const status=err.statusCode||500;
  res.status(status).json({
    success:false,
    status,
    message:err.message||"Internal Server Error",
    ...(config.nodeEnv==="development" && {stack:err.stack})
  });
};

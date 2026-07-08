let settings={hotelName:"Satya 5-Star Hotel",currency:"INR",tax:5};
exports.getSettings=async(req,res)=>res.json({success:true,data:settings});
exports.updateSettings=async(req,res)=>{settings={...settings,...req.body};res.json({success:true,data:settings});};

const mongoose=require("mongoose");
const staffSchema=new mongoose.Schema({
name:{type:String,required:true},
email:{type:String,required:true,unique:true},
phone:String,
role:{type:String,required:true},
salary:{type:Number,default:0},
status:{type:String,enum:["Active","Inactive"],default:"Active"},
// Running totals kept in sync whenever an order assigned to this staff
// member is marked "Completed" (see orderController.updateOrder).
// Avoids re-aggregating the whole Orders collection every time the
// staff list/report is viewed.
totalOrders:{type:Number,default:0},
totalRevenue:{type:Number,default:0}
},{timestamps:true});
module.exports=mongoose.model("Staff",staffSchema);

const mongoose=require("mongoose");
const staffSchema=new mongoose.Schema({
name:{type:String,required:true},
email:{type:String,required:true,unique:true},
phone:String,
role:{type:String,required:true},
salary:{type:Number,default:0},
status:{type:String,enum:["Active","Inactive"],default:"Active"},

// ---- Performance counters ----
// Updated by orderController.updateOrder whenever an order assigned to
// this staff member is marked "Completed". Weekly/monthly/daily
// buckets are reset lazily (see utils/dateRanges + staffController)
// once their stored period no longer matches the current one, so no
// cron job is needed to roll them over.
totalOrders:{type:Number,default:0},
totalRevenue:{type:Number,default:0},

todayRevenue:{type:Number,default:0},
todayDate:{type:Date,default:null},

weeklyRevenue:{type:Number,default:0},
weekStartDate:{type:Date,default:null},

monthlyRevenue:{type:Number,default:0},
monthStartDate:{type:Date,default:null}
},{timestamps:true});
module.exports=mongoose.model("Staff",staffSchema);

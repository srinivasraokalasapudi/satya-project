const mongoose=require("mongoose");
const staffSchema=new mongoose.Schema({
name:{type:String,required:true},
email:{type:String,required:true,unique:true},
phone:String,
role:{type:String,required:true},
salary:{type:Number,default:0},
status:{type:String,enum:["Active","Inactive"],default:"Active"}
},{timestamps:true});
module.exports=mongoose.model("Staff",staffSchema);

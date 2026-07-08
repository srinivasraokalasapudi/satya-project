const mongoose=require("mongoose");
const inventorySchema=new mongoose.Schema({
name:{type:String,required:true},
category:{type:String,required:true},
quantity:{type:Number,default:0},
unit:{type:String,default:"pcs"},
price:{type:Number,default:0},
supplier:{type:String,default:""},
minStock:{type:Number,default:10},
status:{type:String,enum:["Available","Low Stock","Out of Stock"],default:"Available"}
},{timestamps:true});
module.exports=mongoose.model("Inventory",inventorySchema);

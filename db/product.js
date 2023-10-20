const mongoose=require('mongoose');

const productschema=new mongoose.Schema({
    userId:String,
    userEmail:String,
    userName:String,
    userMobile:String,
    semester:String,
    subject:String,
    status:String
});

module.exports=new mongoose.model("productdatas",productschema);
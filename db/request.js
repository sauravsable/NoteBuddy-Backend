const mongoose=require('mongoose');

const requestschema=new mongoose.Schema({
    userEmail:String,
    userName:String,
    requestUserEmail:String,
    requestUsername:String,
    requestUserNumber:String,
    semester:String,
    subject:String,
    status:String,
    message:String
});

module.exports=new mongoose.model("requestdatas",requestschema);
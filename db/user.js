const mongoose=require('mongoose');

const userschema=new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true,
        unique:true
    },
    password:{
        type:String,
        require:true
    },
});

module.exports=new mongoose.model("userdatas",userschema);
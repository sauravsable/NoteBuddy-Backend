const mongoose=require('mongoose');

const productschema=new mongoose.Schema({
    userId:
    {
        type:String,
        required:true,
    },
    semester:{
        type:String,
        require:true
    },
    subject:{
        type:String,
        require:true
    },
    status:{
        type:String,
        require:true
    }
});

module.exports=new mongoose.model("productdatas",productschema);
const mongoose=require('mongoose');

const productschema=new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    email:
    {
        type:String,
        required:true,
        unique:true,
    },
    rollnumber:{
        type:Number,
        require:true,
        unique:true,
    },
    semester:{
        type:String,
        require:true
    },
    subject:{
        type:String,
        require:true
    },
    mobilenumber:{
      type:Number,
      require:true
    },
    address:{
        type:String,
        require:true
    },
    status:{
        type:String,
        require:true
    }
});

module.exports=new mongoose.model("productdatas",productschema);
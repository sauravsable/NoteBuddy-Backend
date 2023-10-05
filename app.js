const express=require('express');
const mongoose=require('mongoose');
const bodyparser=require('body-parser');
const cors=require('cors');
const bcrypt=require("bcryptjs");
const Mail=require('./mail');
const requestMail = require('./contactMail');
require('dotenv').config();

const port= process.env.PORT || 5000;
const link = process.env.MONGO_LINK;

const app=express();
mongoose.connect(link).then(()=> console.log("Database connected")).catch(err => console.log(err));

const usermodel=require('./db/user');
const productmodel=require('./db/product');
const messagemodel=require('./db/message');

app.use(bodyparser.urlencoded({ extended: true }));

app.use(express.json());
app.use(cors({origin:'https://notebuddy-nu.vercel.app',credentials:true}));
// app.use(cors({origin:'http://localhost:3000',credentials:true}));

app.post("/register",async(req,res)=>{

    try{
        const check=await usermodel.findOne({email:req.body.email});

        if(check){
            res.json("exist");
        }
        else{
            req.body.password=await bcrypt.hash(req.body.password,10);
            let user=new usermodel(req.body);
            let data=await user.save();
            
            res.send(data);
        }
    }
    catch(e){
        res.json("not exist")
    }

});

app.post("/login",async(req,res)=>{

        const result=await usermodel.findOne({email:req.body.email});
        if(result){
            const ismatch=await bcrypt.compare(req.body.password,result.password);

            if(ismatch){
                res.send(result);
            }
            else{
                res.json('Notmatch');
            }
        }
        else{
            res.json("Notfound");
        }
    
});


let data={};
let otp;
app.post("/getdata",async (req,res)=>{
    data.provideremail=req.body.email;
    data.subject=req.body.subject;
    data.semester=req.body.semester;
    otp=Mail.otp;
    console.log(Mail.otp);

    const result=await usermodel.findOne({_id:req.body.userId});
    data.email=result.email;
    Mail.sendMail(result.email);
    res.json("true");
});

app.post("/confirmotp",(req,res)=>{
    if(req.body.otp==otp){
        requestMail(data.provideremail,data.email,data.semester,data.subject);
        res.json("true");
    }
    else{
         res.json("false");
    }
});

app.post("/products",async(req,res)=>{
    const products = await productmodel.find({
        status: "available",
        userId: { $ne: req.body.userId}
      }); 
   if(products.length >0){
    res.send(products);
   }
   else{
    res.send({result:"No Products Found"});
   }
});

app.post("/myproducts",async(req,res)=>{
    const products=await productmodel.find({userId:req.body.userId});
    if(products.length>0){
     res.send(products);
    }
    else{
     res.send({result:"No Products Found"});
    }
}); 

app.post("/addproduct",async(req,res)=>{
    let obj={userId:req.body.userId,semester:req.body.formData.semester,subject:req.body.formData.subject,status:req.body.formData.status};
    const product= new productmodel(obj);
    const result=await product.save();
    res.send(result);
});

app.delete("/deleteproduct/:id",async(req,res)=>{
    const result=await productmodel.deleteOne({_id:req.params.id});
    res.send(result);
});

app.get("/getproducttoupdate/:id",async(req,res)=>{
    const result= await productmodel.findOne({_id:req.params.id});

    if(result){
        res.send(result);
    }
    else{
        res.send({result:"Not Found"});
    }

});

app.put("/updateproduct/:id",async(req,res)=>{
    const result= await productmodel.updateOne(
        {_id:req.params.id},
        {
            $set:req.body
        }
    )
    res.send(result);
});

app.get("/search/:key",async(req,res)=>{
    const result= await productmodel.find({
        "$or":[
            {semester:{$regex:req.params.key}},
            {subject:{$regex:req.params.key}},
        ]
    })
    res.send(result);
});

app.post("/sendmessage",async(req,res)=>{
    let user=new messagemodel(req.body);
    let data=await user.save();

    res.json("true");
});

app.listen(port,()=>{
    console.log("server started");
});

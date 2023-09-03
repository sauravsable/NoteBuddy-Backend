const express=require('express');
const mongoose=require('mongoose');
const bodyparser=require('body-parser')
const cors=require('cors');
const bcrypt=require("bcryptjs");
const session=require('express-session');
const Mail=require('./mail')
const requestMail = require('./contactMail');
require('dotenv').config()
const port= process.env.PORT || 5000;
const link = process.env.MONGO_LINK;

const app=express();
mongoose.connect(link).then(()=> console.log("Database connected")).catch(err => console.log(err));

const usermodel=require('./db/user');
const productmodel=require('./db/product');

app.use(bodyparser.urlencoded({ extended: true }));

app.use(express.json());
app.use(cors({origin:'https://sauravnotebuddy.netlify.app',credentials:true}));

app.use(session({
secret:"Notebuddy",
resave:true,
saveUninitialized:true,
}));
app.get("/",(req,res)=>
{
    res.send("hello");
})
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
            
            console.log("signup session");
            console.log(req.session);
            req.session.email=req.body.email;
            req.session.name=req.body.name;
            res.send(data);
        }
    }
    catch(e){
        res.json("not exist")
    }

})

app.post("/login",async(req,res)=>{

        const result=await usermodel.findOne({email:req.body.email});
        if(result){
            const ismatch=await bcrypt.compare(req.body.password,result.password);

            if(ismatch){
                console.log("login session");
                console.log(req.session);
                req.session.email=req.body.email;
                req.session.name=result.name;
                res.send(result);
            }
            else{
                res.json('Notmatch');
            }
        }
        else{
            res.json("Notfound");
        }
    
})

app.get("/logout",(req,res)=>{
    console.log(req.session);
    console.log("session cleared");
    req.session.destroy();
})

app.post("/getdata",(req,res)=>{
    console.log(req.session);
    console.log(req.body);
    req.session.provideremail=req.body.email;
    req.session.subject=req.body.subject;
    req.session.semester=req.body.semester;
    req.session.otp=Mail.otp;
    console.log(Mail.otp);
    Mail.sendMail(req.session.email);
    res.json("true");
})

app.post("/confirmotp",(req,res)=>{
    console.log("confirm otp session");
    console.log(req.session);

    if(req.body.otp==req.session.otp){
        requestMail(req.session.provideremail,req.session.email,req.session.semester,req.session.subject);
        res.json("true");
    }
    else{
         res.json("false");
    }
})

app.get("/products",async(req,res)=>{
    console.log("product session");
    console.log(req.session);
    const products = await productmodel.find({
        status: "available",
        email: { $ne: req.session.email }
      });
   if(products.length >0){
    res.send(products);
   }
   else{
    res.send({result:"No Products Found"});
   }
})


app.get("/myproducts",async(req,res)=>{
    console.log(req.session);
    const products=await productmodel.find({email:req.session.email});

    if(products[0]){
     res.send(products);
    }
    else{
     res.send({result:"No Products Found"});
    }
 }) 

app.post("/addproduct",async(req,res)=>{
    console.log(req.body);
    console.log(req.session);
    let obj={email:req.session.email,semester:req.body.semester,subject:req.body.subject,status:req.body.status};
    const product= new productmodel(obj);
    const result=await product.save();
    res.send(result);
})

app.delete("/deleteproduct/:id",async(req,res)=>{
    const result=await productmodel.deleteOne({_id:req.params.id});
    res.send(result);
})

app.get("/getproducttoupdate/:id",async(req,res)=>{
    const result= await productmodel.findOne({_id:req.params.id});

    if(result){
        res.send(result);
    }
    else{
        res.send({result:"Not Found"});
    }

})

app.put("/updateproduct/:id",async(req,res)=>{
    const result= await productmodel.updateOne(
        {_id:req.params.id},
        {
            $set:req.body
        }
    )
    res.send(result);
})

app.get("/search/:key",async(req,res)=>{
    const result= await productmodel.find({
        "$or":[
            {name:{$regex:req.params.key}},
            {rollnumber:{$regex:req.params.key}},
            {year:{$regex:req.params.key}},
            {semester:{$regex:req.params.key}},
            {subject:{$regex:req.params.key}},
        ]
    })
    res.send(result);
})

app.listen(port,()=>{
    console.log("server started");
});
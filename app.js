const express=require('express');
const mongoose=require('mongoose');
const bodyparser=require('body-parser')
const cors=require('cors');
const bcrypt=require("bcryptjs");
const session=require('express-session');
// const Mail=require('./mail')
require('dotenv').config()

const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;

const app=express();
mongoose.connect(`mongodb+srv://${username}:${password}@cluster0.p0ovcj7.mongodb.net/Notebuddy`).then(()=> console.log("Database connected"))
.catch(err => console.log(err));
const usermodel=require('./db/user');
const productmodel=require('./db/product');

app.use(bodyparser.urlencoded({ extended: true }));

app.use(express.json());
app.use(cors({origin:'http://localhost:3000',credentials:true}));

app.use(session({
secret:"Notebuddy",
resave:false,
saveUninitialized:false,
cookie:{
    maxAge:3600000,
    httpOnly:true
}
}));

app.post("/register",async(req,res)=>{

    try{
        const check=await usermodel.findOne({email:req.body.email});

        if(check){
            res.json("exist");
        }
        else{
            // let mailsend=await Mail("sauravsable4102@gmail.com");
            req.body.password=await bcrypt.hash(req.body.password,10);
    
            let user=new usermodel(req.body);
            let data=await user.save();
            
            req.session.email=req.body.email;
            console.log(req.session.email);

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
                req.session.email=req.body.email;
                console.log(req.session.email);
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

app.get("/products",async(req,res)=>{
   const products=await productmodel.find({status:"available"});

   if(products.length >0){
    res.send(products);
   }
   else{
    res.send({result:"No Products Found"});
   }
})

app.get("/myproducts",async(req,res)=>{
    console.log(req.session.email);
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
    let obj={name:req.body.name,rollnumber:req.body.rollnumber,email:req.session.email,semester:req.body.semester,subject:req.body.subject,mobilenumber:req.body.mobilenumber,address:req.body.address,status:req.body.status};
    const product= new productmodel(obj);
    const result=await product.save();
    res.send(result);
})

app.delete("/product/:id",async(req,res)=>{
    const result=await productmodel.deleteOne({_id:req.params.id});
    res.send(result);
})

app.get("/product/:id",async(req,res)=>{
    const result= await productmodel.findOne({_id:req.params.id});

    if(result){
        res.send(result);
    }
    else{
        res.send({result:"Not Found"});
    }

})

app.put("/products/:id",async(req,res)=>{
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

app.listen("5000",()=>{
    console.log("server started");
});
const express = require("express");
const bcrypt = require('bcrypt')
const validator = require('validator')
const {validateSignUp} = require('../utils/validate')
const {User} = require('../models/User')
const cookieParser = require('cookie-parser')
const {Order} = require('../models/Order')

const authRouter = express.Router()
authRouter.use(express.json())
authRouter.use(express.urlencoded())
authRouter.use(cookieParser())


authRouter.get('/login',(req,res)=>{
    res.render("login.ejs");
})
authRouter.get('/signup',(req,res)=>{
    res.render("signup.ejs");
})

authRouter.post('/login',async (req,res)=>{
    try{
        const {email,password} = req.body
        const user = await User.findOne({email})
        if(!user){
            throw new Error("Invalid Email")
        }
        const inputPassword = password
        const isPassValid = await user.validatePassword(inputPassword)
        if(isPassValid){
            // Creating the jwt token
            const token = await user.getJwt();
            //sending it to user
            res.cookie("token",token)
           if(user.role === "donor"){
               res.redirect('/donor/dashboard')
              }else if(user.role === "institute"){
               res.redirect('/institute/dashboard')
              }else if(user.role === "shopkeeper"){
               res.redirect('/shopkeeper/dashboard')
                }
        }else{
            res.send("Wrong Creds")
        }
    }catch(err){
        res.send("Error : "+err.message)
    }
}
)  


authRouter.post('/signup',async (req,res)=>{
    try{
        validateSignUp(req)
        const {fullname,email,password,role} = req.body
        const hashedPassword = await bcrypt.hash(password,10)   
        const user = new User({
            fullname,
            email,
            password:hashedPassword,
            role
        })
        await user.save()
        res.redirect('/auth/login')
        console.log(user);
        
    }catch(e){
        res.status(400).send(e.message)
    }
})
authRouter.get("/logout",(req,res)=>{
    res.cookie('token',null,{
        expires : new Date(Date.now()) //cookie will expire now
    })
    res.redirect('/auth/login')
})

authRouter.get('/admin', async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('donorId', 'name email') // Donor details
            .populate('shopkeeperId', 'name email') // Assigned shopkeeper details
            .populate('instituteId', 'name email') // Institute details
            .populate({
                path: 'items',
                select: 'itemName quantity unit'
            });

        res.render('adminDashboard', { orders }); // Render the admin dashboard page with orders data
    } catch (err) {
        console.error("Error fetching assigned requests:", err);
        res.status(500).json({ message: "Server error" });
    }
});


module.exports = {
    authRouter
}
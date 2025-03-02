const jwt = require('jsonwebtoken')
const {User} = require("../models/User")


const userAuth = async (req,res,next)=>{
    try{
        const cookies = req.cookies
        const {token} = cookies

        if(!token){
            throw new Error("Please Authenticate")
        }
        const decodedObj = await jwt.verify(token,'rishex')//returns decoded obj
        
        const {_id} = decodedObj
        const user = await User.findById(_id)
        if(!user){
            throw new Error("User Not Found")
        }
        req.user = user
        next()
    }catch(err){
        res.send("Error : "+err.message)
    }

}

module.exports = {
    userAuth
}
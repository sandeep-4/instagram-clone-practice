const jwt=require('jsonwebtoken');
const {JWT_SECRET}=require('../keys');
const User=require('../models/user');

module.exports=async(req,res,next)=>{
    const {authorization}=req.headers;
    if(!authorization){
        res.status(404).json({
            error:"you must be logged in"
        })
        }
        const token=authorization.replace("Bearer ","");
        await jwt.verify(token,JWT_SECRET,async(err,payload)=>{
            if(err){
                res.status(404).json({
                    error:"you must be logged in"
                })  
            }

            //replace id by email later
            const {email}=payload;
            await User.findOne({email})
            .then((userdata)=>{
                // console.log(userdata);
                req.user=userdata
                next();
            })
        });
}
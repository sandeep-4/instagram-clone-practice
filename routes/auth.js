const express=require('express');
const router=express.Router();
const bcrypt=require('bcryptjs');
const User=require('../models/user');
const jwt=require('jsonwebtoken');
const {JWT_SECRET}=require('../keys');
const nodemailer=require('nodemailer');
const crypto=require('crypto');

let transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "springboottest@gmail.com",
      pass: "spring@123"
    }
  });


router.post('/signup',async(req,res)=>{
    const {name,email,password,pic}=req.body;
    if(!email || !name || !password || !pic){
      return  res.json({error:'add all fields'})
    }
    await User.findOne({email:email}).then((savedUser)=>{
        if(savedUser){
            return res.json({error:'User already exists'});
        }
        bcrypt.hash(password,12).then(async(hashedpassword)=>{
            console.log(name);
            await User.create({name,email,pic,password:hashedpassword})
            .then((user)=>{
                transporter.sendMail({
                    to:user.email,
                    from:"instagram@instagram.con",
                    subject:"signup sucess",
                    html:"<h1>Welcome to Instagram</h1>"
                })
                res.json({
                    message:'User created sucessfully',
                   user 
                })
            }).catch(err=>{
                return res.json({error:'User unable to save ',err});
            })
            // console.log(hashedpassword);

        })      
    })
})

router.post('/signin',async(req,res)=>{
    const {email,password}=req.body;
    if(!email || !password){
        return  res.json({error:'invalid crediebtials 1'})
      }
      await User.findOne({email})
      .then((user)=>{
          if(!user){
            return  res.json({error:'invalid crediebtials 2'})
          }
          bcrypt.compare(password,user.password)
          .then((doMatch)=>{
              if(doMatch){
                  const token=jwt.sign({_id:user._id,email:user.email},JWT_SECRET);
                // const token=jwt.sign({email:user.email},JWT_SECRET);
                const {_id,name,email,followers,following,pic}=user;


              res.json({
                  message:'Logged in',
                  token:'Bearer '+token,
                  user:{
                    _id,name,email,followers,following,pic
                  }
                })
              }else{
                return  res.json({error:'invalid crediebtials 3',})
              }
          }).catch((err)=>{
              res.json({error:'invalid credientials 4 : '+err})
          })
      })
})


router.post('/reset-password',async(req,res)=>{
    crypto.randomBytes(32,async(err,buffer)=>{
        if(err){
            console.log(err);
        }
        const token=buffer.toString('hex');
        await User.findOne({email:req.body.email}).
        then(async(user)=>{
            if(!user){
                res.json({message:"Invalid credintials"})
            }
           user.resetToken=token;
           user.expireToken=Date.now()+3600000
           user.save().then((result)=>{
               transporter.sendMail({
                to:user.email,
                from:'instagram@instagram.com',
                subject:'Password reset token',
                html:`<h1>Clink link: <a>http://localhost:3000/reset/${token}</a></h1>`
               })
               res.json({messsge:'We sent link in your email'});
        })
        })
    })
})


router.post("/new=password",async(req,res)=>{
    const newPassword=req.body.password;
    const sentToken=req.body.sentToken;
    await User.findOne({resetToken:sentToken,expireToken:{$gt:Date.now()}})
    .then((user)=>{
        if(!user){
            res.json({message:"Invalid credintials"})  
        }
        bcrypt.hash(newPassword,12).then((hashedpassword)=>{
            user.password=hashedpassword,
            user.resetToken=undefined,
            user.expireToken=undefined
            user.save().then((savedUser)=>{
                res.json({message:"password updated"})
            }).catch((err)=>{
                console.log(err);
            })
        })
    })
})



module.exports=router;

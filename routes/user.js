const express=require('express');
const router=express.Router();
const User=require('../models/user');
const Post=require('../models/post');
const requireLogin=require('../middleware/requireLogin');

router.get('/user/:id',requireLogin, async(req,res)=>{
    await User.findOne({_id:req.params._id})
    .select('-password')
    .then(async(user)=>{
        await Post.find({postedBy:req.params._id})
        .populate('postedBy','_id name')
        .exec((err,posts)=>{
            if(err){
                res.status(402).json({error:err})
            }
            res.json({user,posts})
        })
    }).catch((err)=>{
        res.json({err:'No such user '+err})
    })
})

router.put('/follow',requireLogin,async(req,res)=>{
    await User.findByIdAndUpdate(req.body.followId,{
        $push:{followers:req.user._id}
    },{new:true},async(err,result)=>{
        if(err){
            res.json({err:'No such user '+err})
        }
        await User.findByIdAndUpdate(req.user._id,{
            $push:{following:req.body.followId}   
        },{new:true})
        .then((result)=>{
            res.json(result);
        }).catch((err)=>{
            res.json({err:'No such user '+err})
        })
    })
})

router.put('/unfollowfollow',requireLogin,async(req,res)=>{
    await User.findByIdAndUpdate(req.body.unfollowId,{
        $pull:{followers:req.user._id}
    },{new:true},async(err,result)=>{
        if(err){
            res.json({err:'No such user '+err})
        }
        await User.findByIdAndUpdate(req.user._id,{
            $pull:{following:req.body.unfollowId}   
        },{new:true})
        .then((result)=>{
            res.json(result);
        }).catch((err)=>{
            res.json({err:'No such user '+err})
        })
    })
})

router.put('/updatepic',requireLogin,async(req,res)=>{
    await User.findByIdAndUpdate(req.user._id,{$set:{pic:req.body.pic}},
        {new:true},
        (err,result)=>{
        if(err){
            return res.status(402).json({error:"Pic cant be posted"});
        }
        res.json(result)
    })
})


module.exports=router;
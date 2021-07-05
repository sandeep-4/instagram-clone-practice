const express=require('express');
const router=express.Router();
const User=require('../models/user');
const Post=require('../models/post');
const requireLogin=require('../middleware/requireLogin');

router.get('/allpost',async(req,res)=>{

    await Post.find({}).populate('postedBy',"_id name")
    .populate('comments.postedBy','_id name')
    .sort('-createdAt')
    .then((posts)=>{
        res.json({
            posts
        })
    }).catch((err=>{
        return res.json({error:'User unable  get posts ',err});
    }))
})

router.get('/getsubpost',requireLogin,async(req,res)=>{
    const id=req.user._id;
    await Post.find({postedBy:{$in:req.user.following}})
    await Post.find({}).populate('postedBy',"_id name")
    .populate('comments.postedBy','_id name')
    .sort('-createdAt')
    .then((posts)=>{
        res.json({
            posts
        })
    }).catch((err=>{
        return res.json({error:'User unable  get posts ',err});
    }))
})

router.get('/mypost',requireLogin,async(req,res)=>{
    await Post.find({postedBy:req.user._id}).populate('postedBy','_id name')
    .then((posts)=>{
        res.json({
            posts
        })
    }).catch((err=>{
        return res.json({error:'User unable get  post ',err});
    }))
})

router.post('/createpost',requireLogin,async(req,res)=>{
    const {title,body,pic}=req.body;
    if(!title || ! body || !pic){
        return res.json({error:'Post cant happen'});
    }
   const user= req.user
   user.password=undefined
//    console.log(user);
await Post.create({title,body,photo:pic,postedBy:user}).then((post)=>{
    res.json({
        post
    })
}).catch((err)=>{
    return res.json({error:'Post cant happen'+err});
})
})

router.post('/search-users',async(req,res)=>{
    let userPattern=new RegExp('^'+req.body.query)
    await User.find({email:{$regex:userPattern}})
    .select("_id name")
    .then((user)=>{
        res.json({user})
    }).catch((err)=>{
        return res.json({error:'No such user'+err});
    }) 
})

router.put('/like',requireLogin,async(req,res)=>{
    //findById
    await Post.findOneAndUpdate(req.body.postId,{
        $push:{likes:req.user._id}
    },{new:true}).exec((err,result)=>{
        if(err){
            return res.json({error:'like cant happen'+err});
        }
        res.json(result);
    })
})


router.put('/unlike',requireLogin,async(req,res)=>{
    await Post.findOneAndUpdate(req.body.postId,{
        $pull:{likes:req.user._id}
    },{new:true}).exec((err,result)=>{
        if(err){
            return res.json({error:'like cant happen'+err});
        }
        res.json(result);
    })
})

router.put('/comment',requireLogin,async(req,res)=>{
    const comment={
        text:req.body.text,
        postedBy:req.user._id
    }
    await Post.findOneAndUpdate(req.body.postId,{
        $push:{comments:comment}
    },{new:true})
    .populate("comments.postedBy","id name")
    .populate('postedBy','_id name')
    .exec((err,result)=>{
        if(err){
            return res.json({error:'like cant happen'+err});
        }
        res.json(result);
    })
})


router.delete('/deletepost/:postId',async(req,res)=>{
    await Post.findOne({_id:req.params.postId})
    .populate('postedBy' ,'_id name')
    .exec((err,post)=>{
        if(err || !post){
            return res.status(402).json({error:err})
        }
        if(post.postedBy._id.toString()===req.user._id.toString()){
            post.remove()
            .then((result)=>{
                res.json({result})
            }).catch((err)=>{
                res.json({error:err});
            })
        }
    })
})

module.exports=router;
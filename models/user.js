const mongoose=require('mongoose');
const {ObjectId}=mongoose.Schema.Types;

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    pic:{
        type:String,
        default:"https://res.cloudinary.com/dmctlr8gx/image/upload/v1614693543/download_dasjmw.jpg" 
   },
   resetToken:String,
   expireToken:Date,
    followers:[{
        type:ObjectId,
        ref:'User'
    }],
    following:[{ 
        type:ObjectId,
        ref:'User'
    }]
})

module.exports=mongoose.model('User',userSchema);
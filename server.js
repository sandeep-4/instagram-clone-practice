const express=require('express');
const app=express();
const dotenv=require('dotenv').config();
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
const auth=require('./routes/auth');
const post=require('./routes/post');
const user=require('./routes/user');
const cors=require('cors');


port=process.env.PORT || 5000

app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

app.use(auth);
app.use(post);
app.use(user);

app.listen(port,()=>{
    console.log(`listenning on port ${port}`);
});

mongoose.connect('mongodb://localhost:27017/instagram',{
    useUnifiedTopology: true,
    useNewUrlParser:true,
    useFindAndModify:false   
},()=>{
    console.log('connected to mongoDB');
})
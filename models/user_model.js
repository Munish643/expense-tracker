const mongoose =require ('mongoose')
const { setThePassword } = require('whatwg-url')

//schema design 

const userSchema = new mongoose.Schema({

  name:{
    type:String,
    required:[true,'name is required']
  },
  email:{
    type:String,
    required:[true,'email is required'],
    unique:true 
  },
  password:{
    type:String,
    required:[true,'password is required']
  }
},
{timestamps:true})


//export
const userModel= mongoose.model('User', userSchema)
module.exports=userModel
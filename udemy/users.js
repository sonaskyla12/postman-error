const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys =require('../../config/keys');
const passport =require('passport');
//load user model
const User = require('../../models/User');
router.get('/test', (req, res) => res.json({msg: 'user works'}));
//route Get api/user/register
router.post('/register',(req,res) =>{
  User.findOne({email : req.body.email})
  .then(user =>{
    if(user){
      return res.status(400).json({email:'Email already exist'});
    }else{
      const avatar =gravatar.url(req.body.email,{
        s:'200',
        r:'pg',
        d:'mm'
       } );
      const newUser = new User({
        name:req.body.name,
        email:req.body.email,
        avatar,
        password:req.body.password

      });
      bcrypt.genSalt(10,(err, salt)=>{
        bcrypt.hash(newUser.password,salt,(err,hash) =>{
          if(err) throw err;
          newUser.password = hash;
          newUser.save()
          .then(user => res.json(user))
          .catch(err => console.log(err));
        })
      })
    }
  })
});

        
//login functionality to add token
router.post('/login',(req,res) =>{
  const email = req.body.email;
  const password = req.body.password;
  //find user
  User.findOne({email})
  .then(user =>{
    //check for the user
    if(!user){
      return res.status(404).json({email : 'Email does not exist'});
    }
    //check for password
bcrypt.compare(password,user.password)
.then(isMatch =>{
  if(isMatch){
    //user matched
    const payload ={ id: user.id,name: user.name,avatar:user.avatar}//create jwt payload
    //signed token
    jwt.sign(
      payload,
      keys.secretOrKey,
      {expiresIn:3600},(err,token) =>{
        res.json({
          success :true,
          token : 'Bearer ' + token
        })

      }
  );
  }else{
    return res.status(400).json({password : 'password incorrect'});
  }
})
  })
})
    //to show current user return current user
    //private
    router.get('/current',passport.authenticate('jwt',{ session:false}),(req,res) =>{
      res.json({msg: 'success'});
    });
  


module.exports = router;
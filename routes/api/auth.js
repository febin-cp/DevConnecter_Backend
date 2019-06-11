const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth')
const User = require('../../models/User')
const bcrypt = require('bcryptjs')
const {check, validationResult} = require('express-validator/check');
const config = require('config')
const jwt = require ('jsonwebtoken')

router.get('/',auth ,async (req,res)=>{
    try{
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    }catch(err){
        console.error(err.message)
        res.status(500).json({msg:'Server Error'});
    }
});

router.post('/',[
    check('email','Enter Valid Email Address').isEmail(),
    check('password','Password Required')
        .exists()
],
async (req,res)=>{
    console.log(req.body);
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    const {name,email,password} = req.body;
    try {
        let user = await User.findOne({email});
        if(!user){
            res.status(400).json({errors: [{msg: "Invalid Credentials"}]})
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            res.status(400).json({msg:'Invalid Credentials'})
        }


        const payload = {
            user:{
                id: user.id
            }
        }
        jwt.sign(payload, config.get('jwtToken'),
    {expiresIn: 360000}, (err, token)=>{
        if(err) throw err;
        res.json({token})
    })
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server Error')
    }
    
});

module.exports = router;
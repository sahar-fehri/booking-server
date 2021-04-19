const router    = require('express').Router();
const User      = require('../models/User');
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const Utils     = require('../utils/utils');
var WebProvider = require('../config/provider');
var web3        = new WebProvider().getInstance().web3;
var Mutex       = require('async-mutex').Mutex;
const mutex     = new Mutex();

const {registerValidation, loginValidation} = require ('../validation');


router.post('/register', async (req, res) =>{
    const {error} = registerValidation(req.body);
    if(error){
        return Utils.getJsonResponse('error',400, error.details[0].message, '', res);
    }
    //Check if user already exists
    const exists = await User.findOne({email: req.body.email});
    if(exists){
        return Utils.getJsonResponse('error',400, 'Email already exists', '', res);
    }
    //hashing pwd
    const salt = await bcrypt.genSalt(10);
    const hashedPWD = await bcrypt.hash(req.body.password, salt);
    const accounts = await web3.eth.getAccounts();
    let numberCurrentUsersInDB = await User.countDocuments();

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPWD,
        company: req.body.company,
        address: accounts[numberCurrentUsersInDB],
    });
    try{
          const savedUser= await user.save();
          return Utils.getJsonResponse('ok',200,'', savedUser, res);
    } catch(err){
        console.log(err)
        return Utils.getJsonResponse('error',400, err, '', res);
    }

});

router.post('/login', async (req, res) =>{
    const {error} = loginValidation(req.body);
    if(error){
        return Utils.getJsonResponse('error',400, error.details[0].message, '', res);
    }
    //Check if email already exists
    const user = await User.findOne({email: req.body.email});
    if(!user){
        return Utils.getJsonResponse('error',400, 'Email does not exist', '', res);
    }
    //Check if password is correct
    const isValidPWD = await bcrypt.compare(req.body.password, user.password);
    if(!isValidPWD){
        return Utils.getJsonResponse('error',400, 'INVALID PASSWORD', '', res);
    }
    //token assign
    const token = jwt.sign(
        {_id: user._id},
        process.env.TOKEN_SECRET, {
            expiresIn: '30d'
    });
    return Utils.getJsonResponse('ok',200,'', {token,user}, res);
});



module.exports = router;
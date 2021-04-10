const router    = require('express').Router();
const User      = require('../models/User');
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const Utils     = require('../utils/utils');
var WebProvider = require('../config/provider');
var web3        = new WebProvider().getInstance().web3;

const {registerValidation, loginValidation} = require ('../validation');



router.post('/register', async (req, res) =>{
    //data validation before creatin user

    const {error} = registerValidation(req.body);
    if(error){
        //return res.status(400).send(error.details[0].message)
        return Utils.getJsonResponse('error',400, error.details[0].message, '', res);
    }
    //Check if user already exists
    const exists = await User.findOne({email: req.body.email});
    if(exists){
        //return res.status(400).send('Email already exists');
        return Utils.getJsonResponse('error',400, 'Email already exists', '', res);
    }
    //hashing pwd
    const salt = await bcrypt.genSalt(10);
    const hashedPWD = await bcrypt.hash(req.body.password, salt);

    const accounts = await web3.eth.getAccounts();
    let numberCurrentUsersInDB = await User.countDocuments();
    console.log('number of users', numberCurrentUsersInDB);
    console.log('here', accounts[numberCurrentUsersInDB+1])

    //let account = web3.eth.accounts.create();
    //console.log('newww account generated', account)


    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPWD,
        company: req.body.company,
        address: accounts[numberCurrentUsersInDB],

    });

    try{
        const savedUser= await user.save();
        //res.send(savedUser);
        return Utils.getJsonResponse('ok',200,'', savedUser, res);
    } catch(err){
        console.log(err)
        //res.status(400).send(err);
        return Utils.getJsonResponse('error',400, err, '', res);
    }

});

router.post('/login', async (req, res) =>{
    const {error} = loginValidation(req.body);
    if(error){
      //  return res.status(400).send(error.details[0].message)
        return Utils.getJsonResponse('error',400, error.details[0].message, '', res);
    }
    //Check if email already exists
    const user = await User.findOne({email: req.body.email});
    if(!user){
       // return res.status(400).send('Email does not exist');
        return Utils.getJsonResponse('error',400, 'Email does not exist', '', res);
    }
    //Check if password is correct
    const isValidPWD = await bcrypt.compare(req.body.password, user.password);
    if(!isValidPWD){
        //return res.status(400).send('INVALID PASSWORD');
        return Utils.getJsonResponse('error',400, 'INVALID PASSWORD', '', res);
    }
    //token assign
    const token = jwt.sign(
        {_id: user._id},
        process.env.TOKEN_SECRET, {
            expiresIn: '30d'
    });
   // res.header('auth-token', token).json({token,user})
    return Utils.getJsonResponse('ok',200,'', {token,user}, res);

   // res.send('Logged In Successfully')
});



module.exports = router;
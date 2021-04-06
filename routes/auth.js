const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {registerValidation, loginValidation} = require ('../validation');
const Provider = require('../config/provider')
const provider = new Provider()
const web3 = provider.web3




router.post('/register', async (req, res) =>{
    //data validation before creatin user

    const {error} = registerValidation(req.body);
    if(error){
        return res.status(400).send(error.details[0].message)
    }
    //Check if user already exists
    const exists = await User.findOne({email: req.body.email});
    if(exists){
        return res.status(400).send('Email already exists');
    }
    //hashing pwd
    const salt = await bcrypt.genSalt(10);
    const hashedPWD = await bcrypt.hash(req.body.password, salt);

    let account = web3.eth.accounts.create();
    console.log('newww account generated', account)


    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPWD,
        company: req.body.company,
        address: account.address,
        privateKey: account.privateKey
    });

    try{
        const savedUser= await user.save();
        res.send(savedUser);
    } catch(err){
        console.log(err)
        res.status(400).send(err);
    }

});

router.post('/login', async (req, res) =>{
    const {error} = loginValidation(req.body);
    if(error){
        return res.status(400).send(error.details[0].message)
    }
    //Check if email already exists
    const user = await User.findOne({email: req.body.email});
    if(!user){
        return res.status(400).send('Email does not exist');
    }
    //Check if password is correct
    const isValidPWD = await bcrypt.compare(req.body.password, user.password);
    if(!isValidPWD){
        return res.status(400).send('INVALID PASSWORD');
    }
    //token assign
    const token = jwt.sign(
        {_id: user._id},
        process.env.TOKEN_SECRET, {
            expiresIn: '30d'
    });
    res.header('auth-token', token).json({token,user})

   // res.send('Logged In Successfully')
});



module.exports = router;
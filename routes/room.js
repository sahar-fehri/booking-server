const router = require('express').Router();
const verify = require('../verifyToken');
const User = require('../models/User');
var WebProvider = require('../config/provider');
var web3 = new WebProvider().getInstance().web3;
var provider = new WebProvider().getInstance().provider;
const booking_artifact = require('../app/build/contracts/Booking.json');
const contract = require("@truffle/contract");
let Booking = contract(booking_artifact);
Booking.setProvider(provider);
const {
    BN,
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

const {COLA, PEPSI, EVENT_NAMES}  = require ('../utils/constants');
const Contract = require('../blockchain/contract')

router.post('/book',verify, async (req, res) => {
    console.log(req.user)
    console.log('###########################', req.body)
    //Fetch
    const accounts = await web3.eth.getAccounts()
    console.log(accounts[0], "{{{{{{{{{{{{{{{{{{{{{{{")
    const user = await User.findById(req.user._id);
    console.log("found", user)
    web3.eth.handleRevert = true;
   try{
       const instance = await Contract.initContract();
       try{

           instance.methods.book(
               getHex(user.company),
               getHex(req.body.resource),
               getHex(req.body.start),
               getHex(req.body.end),
               getHex(req.body.eventName)).send({ from: accounts[0],  gas: "220000" })
               .on('receipt', function(receipt){
                   console.log("receipt here !!", receipt)
               })
               .on('transactionHash', function(hash){
                   console.log( "hash here", hash)
               })
               .on('error', function(error, receipt) {
                   console.log('error')
                   console.log(error.data)
               });
       }catch(err){
            console.log(err)
       }
       /* let instance = await Booking.deployed();
        let receipt = await instance.book(
                    getHex(user.company),
                    getHex(req.body.resource),
                    getHex(req.body.start),
                    getHex(req.body.end),
                    new BN(req.body.eventName), {from: user.address, gas: "220000"})

       console.log(receipt)

        */


    /*  console.log(instance.methods)
      instance.methods.book(getHex(user.company),
           getHex(req.body.resource),
           getHex(req.body.start),
           getHex(req.body.end),
           new BN(req.body.eventName)).send({from: user.address, gas: "220000"})
           .on('transactionHash', function(hash){
               console.log( hash)
           })
           .on('receipt', function(receipt){
               console.log(receipt)
           })

           .on('error', function(error, receipt) {
               console.log('gooooooooooooott itttt')
           console.log(error)
           });

     */



    }catch(err){
       console.log("web3.eth.handleRevert =", web3.eth.handleRevert)
       console.error(err);
       console.log("err.message =",err.message);
    }

    //SAVE TO DB
    res.json({
        posts: {
            title: 'ok'
        }
    })
})

const getHex = (arg) => {
    return web3.utils.asciiToHex(arg.toString()).padEnd(66, "0");
}


module.exports = router;
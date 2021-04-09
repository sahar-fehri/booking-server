const router = require('express').Router();
const verify = require('../verifyToken');
const User = require('../models/User');
const Room = require('../models/Room');
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
const confirmationNumber=5;

const {COLA, PEPSI, EVENT_NAMES, Status}  = require ('../utils/constants');
const Contract = require('../blockchain/contract')

router.post('/book',verify, async (req, res) => {
    //Fetch
    const accounts = await web3.eth.getAccounts()
    const user = await User.findById(req.user._id);

    web3.eth.handleRevert = true;
   try{
       const instance = await Contract.initContract();
       instance.methods.book(
           getHex(user.company),
           getHex(req.body.resource),
           getHex(req.body.start),
           getHex(req.body.end),
           getHex(req.body.eventName)).send({ from: user.address,  gas: "220000" })
       .on('receipt', async (receipt)=>{
           console.log("receipt here !!", receipt)
           if(!receipt.events.Book){
               return res.status(400).send("EVENT NOT FOUND")
           }else{
               console.log("here to save", receipt.events.Book.returnValues)
               let {idCompany, idRoom, start, end, idSlot} = receipt.events.Book.returnValues;
               const room = new Room({
                   idRoom: getOriginalValue(idRoom),
                   idSlot: getOriginalValue(idSlot),
                   start: getOriginalValue(start),
                   end: getOriginalValue(end),
                   company: getOriginalValue(idCompany),
                   user: receipt.from ,
                   hash: receipt.transactionHash,
                   status: Status.Booked
               })

               console.log('room finally in db', room)
               try{
                   const savedRoom= await room.save();
                 //  const single = await Room.findOne({idRoom: getOriginalValue(idRoom)});
                   res.send("Successful Booking");
               } catch(err){
                   console.log(err)
                   res.status(400).send(err);
               }

           }

       })
       .on('error', function(error, receipt) {
           console.log('error here !!!! ')
           console.log(error.data)
           if(error.reason){
               return res.status(400).send(error.reason)
           }else{
               return res.status(400).send(error)
           }
       });

    }catch(err){
       console.log('err in catch')
       console.log("web3.eth.handleRevert =", web3.eth.handleRevert)
       console.error(err);
       console.log("err.message =",err.message);
    }

})

router.get('/availibilities',verify, async (req, res) => {
    //Fetch
    const accounts = await web3.eth.getAccounts()
    const user = await User.findById(req.user._id);

    try{
        console.log(user.company)

        const events = await Room.find({company:  user.company});
        console.log('here', events)
        /*
        [{
            title : "koko", //idSlot
            start : new Date('07 April 2021 10:00 UTC'),
            resourceId : "CO1", //idRoom
            end : new Date('07 April 2021 11:00 UTC'),
            color: '#31A537',
            textColor: 'black',
            borderColor: 'lightGray'
            }]
         */
        console.log(user.company)
        res.send('ok')

    }catch(err){

        console.error(err);
        return res.status(400).send(error)
    }

})


const getHex = (arg) => {
    return web3.utils.asciiToHex(arg.toString()).padEnd(66, "0");
}

const getOriginalValue = (hex) => {
    return web3.utils.hexToUtf8(hex);
}


module.exports = router;
const router    = require('express').Router();
const verify    = require('../verifyToken');
const User      = require('../models/User');
const Room      = require('../models/Room');
const Contract  = require('../blockchain/contract');
var WebProvider = require('../config/provider');
var web3        = new WebProvider().getInstance().web3;
var provider    = new WebProvider().getInstance().provider;
const Utils     = require('../utils/utils');
const {Status}  = require ('../utils/constants');



const confirmationNumber=5; // could be used to count number of conf needed once tx is sent on blockchain

router.post('/book',verify, async (req, res) => {
    //Fetch
    const user = await User.findById(req.user._id);
    console.log('user', user)
    web3.eth.handleRevert = true;
   try{
       const instance = await Contract.initContract();
       let {resource, start, end, eventName} = req.body;
       let idSlot = getIdSlot(start, resource, user.company);
       instance.methods.book(
           getHex(user.company),
           getHex(resource),
           getHex(start),
           getHex(end),
           getHex(idSlot)).send({ from: user.address,  gas: "220000" })
       .on('receipt', async (receipt)=>{
           console.log("receipt here !!", receipt)
           if(!receipt.events.Book){
               return Utils.getJsonResponse('error',400, "EVENT NOT FOUND", '', res);
               //return res.status(400).send("EVENT NOT FOUND")
           }else{
               console.log("here to save", receipt.events.Book.returnValues)
               let {idCompany, resourceId, start, end, idSlot} = receipt.events.Book.returnValues;
               const room = new Room({
                   resourceId: getOriginalValue(resourceId),
                   idSlot: getOriginalValue(idSlot),
                   start: Number(getOriginalValue(start)),
                   end: Number(getOriginalValue(end)),
                   company: getOriginalValue(idCompany),
                   user: receipt.from ,
                   hash: receipt.transactionHash,
                   status: Status.Booked,
                   title: eventName
               })
               console.log('original value start', getOriginalValue(start) )
               console.log(Number(getOriginalValue(start)))
               console.log('room finally in db', room)
               try{
                   const savedRoom= await room.save();
                 //  const single = await Room.findOne({resourceId: getOriginalValue(resourceId)});
                   let result = await Room.getAllAvailibilitiesByCompany(user.company);
                   return Utils.getJsonResponse('ok',200,'', result, res);
               } catch(err){
                   console.log(err)
                   return Utils.getJsonResponse('error',400, err, '', res);
               }

           }

       })
       .on('error', function(error, receipt) {
           console.log('error here !!!! ')
           console.log(error.data)
           if(error.reason){
               return Utils.getJsonResponse('error',400, error.reason, '', res);
           }else{
               return Utils.getJsonResponse('error',400, error, '', res);
           }
       });

    }catch(err){
       console.log('err in catch')
       console.log("web3.eth.handleRevert =", web3.eth.handleRevert)
       console.error(err);
       console.log("err.message =",err.message);
       return Utils.getJsonResponse('error',400, err, '', res);
    }

})


router.post('/cancel',verify, async (req, res) => {
    //Fetch
    const user = await User.findById(req.user._id);
    console.log('user', user)
    web3.eth.handleRevert = true;
    try{
        const instance = await Contract.initContract();
        let {resource, start, end, eventName} = req.body;
        let idSlot = getIdSlot(start, resource, user.company);
        instance.methods.cancel(
            getHex(user.company),
            getHex(resource),
            getHex(start),
            getHex(end),
            getHex(idSlot)).send({ from: user.address,  gas: "220000" })
            .on('receipt', async (receipt)=>{
                console.log("receipt here !!", receipt)
                if(!receipt.events.Cancel){
                    return Utils.getJsonResponse('error',400, "EVENT Cancel NOT FOUND", '', res);
                    //return res.status(400).send("EVENT NOT FOUND")
                }else{
                   // console.log("here to save", receipt.events.Cancel.returnValues)
                    let {idSlot} = receipt.events.Cancel.returnValues;
                    //update the booked event to cancelled
                    try{
                        const cancelled= await Room.cancelRoom(getOriginalValue(idSlot));
                        console.log('canceeleeed', cancelled)
                        //  const single = await Room.findOne({resourceId: getOriginalValue(resourceId)});
                        let result = await Room.getAllAvailibilitiesByCompany(user.company);
                        return Utils.getJsonResponse('ok',200,'', result, res);
                    } catch(err){
                        console.log(err)
                        return Utils.getJsonResponse('error',400, err, '', res);
                    }

                }

            })
            .on('error', function(error, receipt) {
                console.log('error here !!!! ')
                console.log(error.data)
                if(error.reason){
                    return Utils.getJsonResponse('error',400, error.reason, '', res);
                }else{
                    return Utils.getJsonResponse('error',400, error, '', res);
                }
            });

    }catch(err){
        console.log('err in catch')
        console.log("web3.eth.handleRevert =", web3.eth.handleRevert)
        console.error(err);
        console.log("err.message =",err.message);
        return Utils.getJsonResponse('error',400, err, '', res);
    }

})

router.get('/availibilities',verify, async (req, res) => {
    const user = await User.findById(req.user._id);

    try{
        console.log(user.company)
        let result = await Room.getAllAvailibilitiesByCompany(user.company);
        console.log('here', result)
        return Utils.getJsonResponse('ok',200,'', result, res);

    }catch(err){
        console.error(err);
        return Utils.getJsonResponse('error',400, err, '', res);
    }

})


const getHex = (arg) => {
    return web3.utils.asciiToHex(arg.toString()).padEnd(66, "0");
}

const getOriginalValue = (hex) => {
    return web3.utils.hexToUtf8(hex);
}

const getIdSlot=(start, resourceId, idCompany) =>{
    return start+resourceId+idCompany;
}


module.exports = router;
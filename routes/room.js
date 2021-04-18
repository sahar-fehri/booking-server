const router        = require('express').Router();
const verify        = require('../verifyToken');
const amqp          = require('amqplib');
const User          = require('../models/User');
const Room          = require('../models/Room');
const Transaction   = require('../models/Transaction');
const Contract      = require('../blockchain/contract');
var WebProvider     = require('../config/provider');
var web3            = new WebProvider().getInstance().web3;
var provider        = new WebProvider().getInstance().provider;
const Utils         = require('../utils/utils');
const {Status, TX_Status}  = require ('../utils/constants');


const messageQueueConnectionString = process.env.RABBITMQ_URL;

const confirmationNumber=5; // could be used to count number of conf needed once tx is sent on blockchain


const MessageBroker = require('../broker');

router.post('/book',verify, async (req, res) => {
    const user = await User.findById(req.user._id);
    console.log('user', user)

    try{

        let {resource, start, end, eventName} = req.body;
        const transaction = new Transaction({
            user: user._id,
            idSlot: getIdSlot(start, resource, user.company),
            status: TX_Status.Pending,
        })
        const savedTx = await transaction.save();

        const broker = await MessageBroker.getInstance();

        let requestId = savedTx._id;
        let requestData = req.body;

        await publishToChannel(broker.channel, { routingKey: "book", exchangeName: "processing", data: { requestId, requestData } });
        console.log("Published a request message, requestId:", requestId);

        return Utils.getJsonResponse('ok',200,'', savedTx, res);

    }catch(err){
        console.error(err);
        return Utils.getJsonResponse('error',400, err, '', res);
    }

})

router.post('/cancel',verify, async (req, res) => {
    const user = await User.findById(req.user._id);
    console.log('user', user)

    try{

        let {resource, start, end, eventName} = req.body;
        let idSlot = getIdSlot(start, resource, user.company);
        let found = await Room.isBooked(idSlot, Status.Booked, user.company);
        console.log('founnd', found)
        if(!found){
            return Utils.getJsonResponse('error',400, 'Room has to be booked to be able to cancel it', '', res);
        }
        const transaction = new Transaction({
            user: user._id,
            idSlot: getIdSlot(start, resource, user.company),
            status: TX_Status.Pending,
        })
        const savedTx = await transaction.save();
        const broker = await MessageBroker.getInstance();
        let requestId = savedTx._id;
        let requestData = req.body;

        await publishToChannel(broker.cancelChannel, { routingKey: "cancel", exchangeName: "processing", data: { requestId, requestData } });
        console.log("Published a request message, requestId:", requestId);

        return Utils.getJsonResponse('ok',200,'', savedTx, res);

    }catch(err){
        console.error(err);
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


/*
//old code of cancel endpoint
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

 */
/*
// old code of book endpoint
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


 */

const getHex = (arg) => {
    return web3.utils.asciiToHex(arg.toString()).padEnd(66, "0");
}

const getOriginalValue = (hex) => {
    return web3.utils.hexToUtf8(hex);
}

const getIdSlot=(start, resourceId, idCompany) =>{
    return start+resourceId+idCompany;
}

// utility function to publish messages to a channel
function publishToChannel(channel, { routingKey, exchangeName, data }) {
    return new Promise((resolve, reject) => {
        channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify(data), 'utf-8'), { persistent: true }, function (err, ok) {
            if (err) {
                return reject(err);
            }

            resolve();
        })
    });
}



module.exports = router;
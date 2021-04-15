const express = require('express');
const cors = require('cors');
const amqp = require('amqplib');
const app = express();
const db = require ('../config/db');
const mongoose  = require('mongoose');
const User          = require('../models/User');
const Room          = require('../models/Room');
const Transaction   = require('../models/Transaction');
const Contract      = require('../blockchain/contract');
var WebProvider     = require('../config/provider');
var web3            = new WebProvider().getInstance().web3;
const {Status, TX_Status}  = require ('../utils/constants');
require('dotenv').config();


const messageQueueConnectionString = process.env.RABBITMQ_URL;
const MessageBroker = require('../broker');
(async () => {
    try{
        console.log('here in booking consumer')
        const broker = await MessageBroker.getInstance();
        let connection = broker.connection;
        let channel = broker.channel;
        await channel.prefetch(1);
        // start consuming messages
        await consumeBooking({ connection, channel });

    }catch(error){
        console.log(error)
    }
})();


app.listen(5000, ()=> {
    console.log('consumer running')
})

// consume messages from RabbitMQ
function consumeBooking({ connection, channel }) {
    return new Promise((resolve, reject) => {
        channel.consume("processing.book", async function (msg) {
            // parse message
            let msgBody = msg.content.toString();
            let data = JSON.parse(msgBody);
            let requestId = data.requestId;
            let requestData = data.requestData;
            console.log("Received a request for booking message, requestId:", requestId);
            // acknowledge message as processed successfully
            await executeBooking(requestId, requestData)
            await channel.ack(msg);
        });

        // handle connection closed
        connection.on("close", (err) => {
            return reject(err);
        });

        // handle errors
        connection.on("error", (err) => {
            return reject(err);
        });
    });
}

const executeBooking = async (reqID, data) => {
    try{
        const instance = await Contract.initContract();
        let {resource, start, end, eventName} = data;
        //
        let tx = await Transaction.findById(reqID);
        console.log('found tx', tx)
        let user = await User.findById(tx.user)
        console.log('user comp', user.company)
        let idSlot = getIdSlot(start, resource, user.company);
        instance.methods.book(
            getHex(user.company),
            getHex(resource),
            getHex(start),
            getHex(end),
            getHex(idSlot)).send({ from: user.address,  gas: "220000" })
            .on('receipt', async (receipt)=>{
                if(!receipt.events.Book){
                    //save error
                    await Transaction.updateTX(reqID, TX_Status.Cancelled)
                    console.log("errorrr")
                    //return Utils.getJsonResponse('error',400, "EVENT NOT FOUND", '', res);
                    //return res.status(400).send("EVENT NOT FOUND")
                }else{
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
                    const savedRoom= await room.save();
                    await Transaction.updateTX(reqID, TX_Status.Confirmed)
                }

            })
            .on('error', async (error, receipt) => {
                console.log('error here !!!! ')
                console.log(error.data)
                await Transaction.updateTX(reqID, TX_Status.Cancelled)
            });

    }catch(err){
        console.log('err in catch')
        console.log("web3.eth.handleRevert =", web3.eth.handleRevert)
        console.error(err);
        console.log("err.message =",err.message);
        await Transaction.updateTX(reqID, TX_Status.Cancelled)

    }
}


const getIdSlot=(start, resourceId, idCompany) =>{
    return start+resourceId+idCompany;
}
const getHex = (arg) => {
    return web3.utils.asciiToHex(arg.toString()).padEnd(66, "0");
}

const getOriginalValue = (hex) => {
    return web3.utils.hexToUtf8(hex);
}



module.exports = app;
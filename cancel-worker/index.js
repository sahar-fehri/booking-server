const express = require('express');
const app = express();
const db = require ('../config/db');
const mongoose  = require('mongoose');
const amqp = require('amqplib');
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
        console.log('here in cancel worker')
        const broker = await MessageBroker.getInstance();
        let connection = broker.connection;
        let channel = broker.cancelChannel;
        await channel.prefetch(1);
        await consumeCancel({ connection, channel });
    }catch(error){
        console.log(error)
    }
})();


app.listen(5001, ()=> {
    console.log('consumer for cancel running')
})


// consume messages from RabbitMQ
function consumeCancel({ connection, channel }) {
    return new Promise((resolve, reject) => {
        channel.consume("processing.cancel", async function (msg) {
            // parse message
            let msgBody = msg.content.toString();
            let data = JSON.parse(msgBody);
            let requestId = data.requestId;
            let requestData = data.requestData;
            console.log("Received a request for cancel message, requestId:", requestId);
            // acknowledge message as processed successfully
            await executeCancel(requestId, requestData)
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


const executeCancel = async (reqID, data) => {
    try{
        const instance = await Contract.initContract();
        let {resource, start, end, eventName} = data;

        let tx = await Transaction.findById(reqID);
        console.log('found tx', tx)
        let user = await User.findById(tx.user)
        console.log('user comp', user.company)


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
                    await Transaction.updateTX(reqID, TX_Status.Cancelled)
                    console.log("errorrr")
                }else{
                    let {idSlot} = receipt.events.Cancel.returnValues;
                    const cancelled= await Room.cancelRoom(getOriginalValue(idSlot));
                    await Transaction.updateTX(reqID, TX_Status.Confirmed)
                    console.log('canceeleeed', cancelled)
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
const express = require('express');
const app = express();
const db = require ('../config/db');
const mongoose  = require('mongoose');
const cors = require('cors');
const amqp = require('amqplib');
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





module.exports = app;
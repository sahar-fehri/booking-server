const express = require('express');
const app = express();
const db = require ('./config/db');
const mongoose  = require('mongoose');
const cors = require('cors');
require('dotenv').config();


const {subscribeLogEvent, deployBookingContract} = require('./blockchain/blockchain')

const {COLA, PEPSI, EVENT_NAMES}  = require ('./utils/constants');
const {
    BN,
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');



//Importing routes
const authRoute = require('./routes/auth');
const roomRoute = require('./routes/room');

//Middlewares for routes

app.use(express.json());
app.use(cors());
app.use('/api', authRoute);
app.use('/api/room', roomRoute);



(async () => {
    try{
        let instance = await deployBookingContract();
       
        for(let event of EVENT_NAMES){
            subscribeLogEvent(instance, event);
        }
    }catch(error){
        console.log(error)
    }
})();


app.listen(3000, ()=> {
    console.log('server running')
})


module.exports = app;
const express = require('express');
const app = express();
const db = require ('./config/db');
const mongoose  = require('mongoose');
const cors = require('cors');
require('dotenv').config();

//const Provider = require('./config/provider')
const {subscribeLogEvent, deployBookingContract} = require('./blockchain/blockchain')

const {COLA, PEPSI, EVENT_NAMES}  = require ('./utils/constants');
const {
    BN,
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

//const provider = new Provider()
//const myProvider = provider.provider

//const web3 = provider.web3


//Importing routes
const authRoute = require('./routes/auth');
const userRoute = require('./routes/user');

//Middlewares for routes

app.use(express.json());
app.use(cors());
app.use('/api', authRoute);
app.use('/api/user', userRoute);



(async () => {
  /*  let start = 1617651955152;
    let end = start + 1 * 3600;
    let startHex = web3.utils.asciiToHex(start.toString()).padEnd(66, "0");
    let endHex = web3.utils.asciiToHex(end.toString()).padEnd(66, "0");
    const idSlot = new BN('1');
    const MAP_COLA = COLA.map(elm => web3.utils.asciiToHex(elm).padEnd(66, "0"));
    const MAP_PEPSI = PEPSI.map(elm => web3.utils.asciiToHex(elm).padEnd(66, "0"));
    const ID_COLA = web3.utils.asciiToHex("COLA").padEnd(66, "0")
    const ID_PEPSI = web3.utils.asciiToHex("PEPSI").padEnd(66, "0")
    let accounts = await web3.eth.getAccounts()
    
   */

    try{
        let instance = await deployBookingContract();
        console.log(instance.address)
        for(let event of EVENT_NAMES){
            subscribeLogEvent(instance, event);
        }
      //  let receipt = await instance.book(ID_COLA, MAP_COLA[1], startHex, endHex, idSlot, {from: accounts[0], gas: "220000"})
       // console.log(receipt)


    }catch(error){
        console.log(error)
    }
})();





app.listen(3000, ()=> {
    console.log('server running')
})
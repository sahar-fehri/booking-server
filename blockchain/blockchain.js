
const booking_artifact = require('../app/build/contracts/Booking.json');
const contract = require("@truffle/contract");

var WebProvider = require('../config/provider');

var web3 = new WebProvider().getInstance().web3;
var provider = new WebProvider().getInstance().provider;

const {COLA, PEPSI}  = require ('../utils/constants');
let Booking = contract(booking_artifact);
Booking.setProvider(provider);

const subscribeLogEvent = (instance, eventName) => {
        const eventJsonInterface = web3.utils._.find(
            instance.contract._jsonInterface,
            o => o.name === eventName && o.type === 'event',
        )

        const subscription = web3.eth.subscribe('logs', {
            address: instance.address,
            topics: [eventJsonInterface.signature]
        }, async (error, result) => {
            if (!error) {
                console.log('Received result', result)

            }
        })
        .on("data", async (log) =>  {
            if(eventName === 'Book'){
                console.log('Event Book is Fired')
            }
        })

}

const deployBookingContract = async () => {
    //let start = 1617651955152;
    //let end = start + 1 * 3600;
    //let startHex = web3.utils.asciiToHex(start.toString()).padEnd(66, "0");
    //let endHex = web3.utils.asciiToHex(end.toString()).padEnd(66, "0");
    //const idSlot = new BN('1');
    const MAP_COLA = COLA.map(elm => web3.utils.asciiToHex(elm).padEnd(66, "0"));
    const MAP_PEPSI = PEPSI.map(elm => web3.utils.asciiToHex(elm).padEnd(66, "0"));
    const ID_COLA = web3.utils.asciiToHex("COLA").padEnd(66, "0")
    const ID_PEPSI = web3.utils.asciiToHex("PEPSI").padEnd(66, "0")
    let accounts = await web3.eth.getAccounts()
    try{
        let instance = await Booking.new( MAP_COLA, ID_COLA, MAP_PEPSI, ID_PEPSI, {from: accounts[0]});
        return instance;
    }catch (e) {
        console.log('ERROR while deploying smart contract!')
    }

}

module.exports =  {subscribeLogEvent, deployBookingContract};

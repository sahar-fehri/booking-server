const Contract = require('./contract')
var WebProvider = require('../config/provider');
var web3 = new WebProvider().getInstance().web3;
var provider = new WebProvider().getInstance().provider;
const Room = require('../models/Room');

const subscribeLogEvent = (instance, eventName) => {

        const eventJsonInterface = web3.utils._.find(

            instance._jsonInterface,
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
                console.log("save to db")
                console.log('log', log)
                let eventObj = web3.eth.abi.decodeLog(
                    eventJsonInterface.inputs,
                    log.data,
                    log.topics.slice(1)
                )

                let {idCompany, idRoom, start, end, idSlot} = eventObj;
           /*     const room = new Room({
                    idRoom: getOriginalValue(idRoom),
                    idSlot: getOriginalValue(idSlot),
                    start: getOriginalValue(start),
                    end: getOriginalValue(end),
                    company: getOriginalValue(idCompany),
                    user: log.address ,
                    hash: log.transactionHash
                })

                console.log('room', room)
                try{
                    const savedRoom= await room.save();
                    const single = await Room.findOne({idRoom: getOriginalValue(idRoom)});
                    console.log('founddddddddddd', single)
                    console.log('founddddddddddd', single.idRoom)
                } catch(err){
                    console.log(err)
                    res.status(400).send(err);
                }

            */

            }
        })


}

const deployBookingContract = async () => {
    try{
        const instance = await Contract.initContract()
        web3.eth.handleRevert = true;
        return instance;
    }catch (e) {
        console.log('ERROR while deploying smart contract!', e)
    }

}




module.exports =  {subscribeLogEvent, deployBookingContract};

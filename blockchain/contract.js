var WebProvider = require('../config/provider');
var web3 = new WebProvider().getInstance().web3;
var provider = new WebProvider().getInstance().provider;
const {COLA, PEPSI, EVENT_NAMES}  = require ('../utils/constants');
const {
    BN,
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');
const { ADDRESS, ABI } = require('./metadata')
let start = 1617651955152;
let end = start + 1 * 3600;
let startHex = web3.utils.asciiToHex(start.toString()).padEnd(66, "0");
let endHex = web3.utils.asciiToHex(end.toString()).padEnd(66, "0");
const idSlot = new BN('1');

const MAP_COLA = COLA.map(elm => web3.utils.asciiToHex(elm).padEnd(66, "0"));
const MAP_PEPSI = PEPSI.map(elm => web3.utils.asciiToHex(elm).padEnd(66, "0"));
const ID_COLA = web3.utils.asciiToHex("COLA").padEnd(66, "0")
const ID_PEPSI = web3.utils.asciiToHex("PEPSI").padEnd(66, "0")
const Web3EthContract = require('web3-eth-contract');
Web3EthContract.setProvider(provider);
const newIDCOM= web3.utils.asciiToHex("COLA").padEnd(66, "0")
const newIDSLOT= web3.utils.asciiToHex("momo").padEnd(66, "0")

class Contract {
    // create contract instance
    static async initContract() {
        const instance = new Web3EthContract(ABI, ADDRESS);
       // const instance =  new this.web3.eth.Contract(ABI, ADDRESS)
        /*   console.log('here ur address', ADDRESS)
          let accounts = await web3.eth.getAccounts()
           try{

             instance.methods.book(ID_COLA, MAP_COLA[1], startHex, endHex, idSlot)
                 .send({ from: accounts[0],  gas: "220000" })
                 .then((receipt) => console.log(receipt.transactionHash))


             //  instance.methods.book(ID_COLA, MAP_COLA[1], startHex, endHex, newIDSLOT).send({ from: accounts[0],  gas: "220000" })

             instance.methods.test(newIDCOM, newIDSLOT).send({ from: accounts[0],  gas: "220000" })
                 .on('receipt', function(receipt){
                     console.log("receipt here !!", receipt)
                 })
                 .on('transactionHash', function(hash){
                     console.log( "hash here", hash)
                 })
                 .on('error', function(error, receipt) {
                     console.log('error')
                     console.log(error.data)
                 });
          }catch(errr){
              console.log('er', errr)
          }*/
        return instance
    }
}
module.exports = Contract
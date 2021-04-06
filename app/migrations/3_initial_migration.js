let Booking = artifacts.require("Booking");
const Provider = require('../../config/provider')
const provider = new Provider()
const web3 = provider.web3
const {COLA, PEPSI}  = require ('../../utils/constants');



module.exports = async (deployer) => {
    //prepare the encoding to array of strings
    const map1 = COLA.map(elm => web3.utils.asciiToHex(elm).padEnd(66, "0"));
    const map2 = PEPSI.map(elm => web3.utils.asciiToHex(elm).padEnd(66, "0"));
    const ID_COLA = web3.utils.asciiToHex("COLA").padEnd(66, "0")
    const ID_PEPSI = web3.utils.asciiToHex("PEPSI").padEnd(66, "0")
    await deployer.deploy(Booking, map1, ID_COLA, map2, ID_PEPSI);
    let booking = await Booking.deployed();
}
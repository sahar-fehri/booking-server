let Booking = artifacts.require("Booking");
//const Provider = require('../../config/provider')
//const provider = new Provider()
//const web3 = provider.web3
var WebProvider = require('../../config/provider');
var web3 = new WebProvider().getInstance().web3;
const {COLA, PEPSI}  = require ('../../utils/constants');
const fs = require('fs');
const path = '/../../blockchain/metadata.js';


module.exports = async (deployer) => {
    //prepare the encoding to array of strings
    const map1 = COLA.map(elm => web3.utils.asciiToHex(elm).padEnd(66, "0"));
    const map2 = PEPSI.map(elm => web3.utils.asciiToHex(elm).padEnd(66, "0"));
    const ID_COLA = web3.utils.asciiToHex("COLA").padEnd(66, "0")
    const ID_PEPSI = web3.utils.asciiToHex("PEPSI").padEnd(66, "0")
    await deployer.deploy(Booking, map1, ID_COLA, map2, ID_PEPSI);
    let booking = await Booking.deployed();

    await appendADDRESS(booking, '\nconst ADDRESS = ' + "'" + booking.address + "';")
    await appendABI(booking,  '\nconst ABI = ' + JSON.stringify(booking.abi) + ';')
    await append()
}

const appendADDRESS = async (contract, line) => {
    return fs.promises.writeFile(
        __dirname + path,
        line,
        (err) => {
            if (err) {
                console.log(err)
            } else {
            }
        },
    )
}

const appendABI = async (contract, line) => {
    return fs.promises.appendFile(
        __dirname + path,
        line,
        (err) => {
            if (err) {
                console.log(err)
            } else {
            }
        },
    )
}

const append = async () => {
    return fs.promises.appendFile(
        __dirname + path,
        '\nmodule.exports = { ABI, ADDRESS };',
        (err) => {
            if (err) {
                console.log(err)
            }
        },
    )
}
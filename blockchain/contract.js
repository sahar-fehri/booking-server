var WebProvider = require('../config/provider');
var web3 = new WebProvider().getInstance().web3;
var provider = new WebProvider().getInstance().provider;

const { ADDRESS, ABI } = require('./metadata')

const Web3EthContract = require('web3-eth-contract');
Web3EthContract.setProvider(provider);


class Contract {
    // create contract instance
    static async initContract() {
        const instance = new Web3EthContract(ABI, ADDRESS);

        return instance
    }
}
module.exports = Contract
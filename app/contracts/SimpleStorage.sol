//Tell the Solidity compiler what version to use
pragma solidity ^0.5.3;

//Declares a new contract
contract SimpleStorage {
    //Storage. Persists in between transactions
    uint256 x;
    event Done(uint256 value);
    constructor() public {

    }

    //Allows the unsigned integer stored to be changed
    function set (uint256 newValue) public {
        x = newValue;
        emit Done(x);
    }

    //Returns the currently stored unsigned integer
    function get() public returns (uint256) {
        return x;
    }
}
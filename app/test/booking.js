const Booking = artifacts.require('Booking');
const {COLA, PEPSI}  = require ('../../utils/constants');
const {
    BN,
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');




contract('Booking', (accounts) => {
    console.log('accc', accounts[0])
    let booking;
    const myNumberValue = new BN('100');
    const MAP_COLA = COLA.map(elm => web3.utils.asciiToHex(elm).padEnd(66, "0"));
    const MAP_PEPSI = PEPSI.map(elm => web3.utils.asciiToHex(elm).padEnd(66, "0"));
    const ID_COLA = web3.utils.asciiToHex("COLA").padEnd(66, "0")
    const ID_PEPSI = web3.utils.asciiToHex("PEPSI").padEnd(66, "0")
    const WRONG_ROOM_ID = web3.utils.asciiToHex("KOKO").padEnd(66, "0")
    let start = 1617651955152;
    let end = start + 1 * 3600


    before('setup contract', async () => {
        booking = await Booking.new( MAP_COLA, ID_COLA, MAP_PEPSI, ID_PEPSI);
    })

    it('should book', async () => {
        console.log('accc', accounts[0])
        let startHex = web3.utils.asciiToHex(start.toString()).padEnd(66, "0");

        let endHex = web3.utils.asciiToHex(end.toString()).padEnd(66, "0");
        const idSlot = new BN('1');
        //bytes32  idCompany, bytes32  idRoom, bytes32  start, bytes32  end, uint256 idSlot
        let receipt = await booking.book(ID_COLA, MAP_COLA[0], startHex, endHex, idSlot );
        expectEvent(receipt, 'Book', {
            idCompany: ID_COLA,
            idRoom: MAP_COLA[0],
            start: startHex,
            end: endHex,
            idSlot: idSlot
        });

    })

    it('should fail booking with a non existing roomID', async () => {
        let startHex = web3.utils.asciiToHex(start.toString()).padEnd(66, "0");

        let endHex = web3.utils.asciiToHex(end.toString()).padEnd(66, "0");
        const idSlot = new BN('1');
        //bytes32  idCompany, bytes32  idRoom, bytes32  start, bytes32  end, uint256 idSlot
        await expectRevert(
            booking.book(ID_COLA, WRONG_ROOM_ID, startHex, endHex, idSlot),
            'revert',
        );

    })

    it('should fail booking the same room at the same slot ID', async () => {
        let startHex = web3.utils.asciiToHex(start.toString()).padEnd(66, "0");

        let endHex = web3.utils.asciiToHex(end.toString()).padEnd(66, "0");
        const idSlot = new BN('1');
        //bytes32  idCompany, bytes32  idRoom, bytes32  start, bytes32  end, uint256 idSlot
        await expectRevert(
            booking.book(ID_COLA, MAP_COLA[0], startHex, endHex, idSlot),
            'revert',
        );

    })

    it('should cancel a slot', async () => {
        let startHex = web3.utils.asciiToHex(start.toString()).padEnd(66, "0");

        let endHex = web3.utils.asciiToHex(end.toString()).padEnd(66, "0");
        const idSlot = new BN('1');
        //bytes32  idCompany, bytes32  idRoom, bytes32  start, bytes32  end, uint256 idSlot
        let receipt = await booking.cancel(ID_COLA, MAP_COLA[0], startHex, endHex, idSlot );
        expectEvent(receipt, 'Cancel', {
            idCompany: ID_COLA,
            idRoom: MAP_COLA[0],
            start: startHex,
            end: endHex,
            idSlot: idSlot
        });

    })

    it('should fail to cancel a non existing room', async () => {
        let startHex = web3.utils.asciiToHex(start.toString()).padEnd(66, "0");

        let endHex = web3.utils.asciiToHex(end.toString()).padEnd(66, "0");
        const idSlot = new BN('1');
        //bytes32  idCompany, bytes32  idRoom, bytes32  start, bytes32  end, uint256 idSlot
        await expectRevert(
            booking.cancel(ID_COLA, WRONG_ROOM_ID, startHex, endHex, idSlot),
            'revert',
        );
    })


})
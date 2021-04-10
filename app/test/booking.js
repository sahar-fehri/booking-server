const Booking = artifacts.require('Booking');
const {COLA, PEPSI}  = require ('../../utils/constants');
const {
    BN,
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

const myNumberValue = new BN('100');
const MAP_COLA = COLA.map(elm => web3.utils.asciiToHex(elm).padEnd(66, "0"));
const MAP_PEPSI = PEPSI.map(elm => web3.utils.asciiToHex(elm).padEnd(66, "0"));
const ID_COLA = "COLA"
const ID_PEPSI = "PEPSI"
const WRONG_ROOM_ID = web3.utils.asciiToHex("KOKO").padEnd(66, "0")

let start = 1617651955152;
let end = start + 1 * 3600
let eventTitle = "random";



contract('Booking', (accounts) => {
    console.log('accc', accounts[0])
    let booking;

    before('setup contract', async () => {
        booking = await Booking.new( MAP_COLA, getHex(ID_COLA), MAP_PEPSI, getHex(ID_PEPSI));
    })

    it('should book', async () => {
        console.log('accc', accounts[0])
        const idSlot = getIdSlot(start, ID_COLA);

        //bytes32  idCompany, bytes32  resourceId, bytes32  start, bytes32  end, uint256 idSlot
        let receipt = await booking.book(getHex(ID_COLA), MAP_COLA[0], getHex(start), getHex(end), getHex(idSlot) );
        expectEvent(receipt, 'Book', {
            idCompany: getHex(ID_COLA),
            resourceId: MAP_COLA[0],
            start: getHex(start),
            end: getHex(end),
            idSlot: getHex(idSlot)
        });

    })


    it('should fail booking with a non existing roomID', async () => {
        let startHex = web3.utils.asciiToHex(start.toString()).padEnd(66, "0");
        const idSlot = getIdSlot(start, ID_COLA);
        let endHex = web3.utils.asciiToHex(end.toString()).padEnd(66, "0");

        //bytes32  idCompany, bytes32  resourceId, bytes32  start, bytes32  end, uint256 idSlot
        await expectRevert(
            booking.book(getHex(ID_COLA), WRONG_ROOM_ID, getHex(start), getHex(end), getHex(idSlot)),
            'revert',
        );

    })


     it('should fail booking the same room at the same slot ID', async () => {
         let startHex = web3.utils.asciiToHex(start.toString()).padEnd(66, "0");
         web3.eth.handleRevert = true;
         let endHex = web3.utils.asciiToHex(end.toString()).padEnd(66, "0");
         const idSlot = getIdSlot(start, ID_COLA);
         //bytes32  idCompany, bytes32  resourceId, bytes32  start, bytes32  end, uint256 idSlot
         await expectRevert(
             booking.book(getHex(ID_COLA), MAP_COLA[0], getHex(start), getHex(end), getHex(idSlot)),
             'revert',
         );

     })


    it('should cancel a slot', async () => {

      const idSlot = getIdSlot(start, ID_COLA);
      //bytes32  idCompany, bytes32  resourceId, bytes32  start, bytes32  end, uint256 idSlot
      let receipt = await booking.cancel(getHex(ID_COLA), MAP_COLA[0], getHex(start), getHex(end), getHex(idSlot) );
      expectEvent(receipt, 'Cancel', {
          idCompany: getHex(ID_COLA),
          resourceId: MAP_COLA[0],
          start: getHex(start),
          end: getHex(end),
          idSlot: getHex(idSlot)
      });

    })

    it('should book a slot cancelled', async () => {

        const idSlot = getIdSlot(start, ID_COLA);
        //bytes32  idCompany, bytes32  resourceId, bytes32  start, bytes32  end, uint256 idSlot
        let receipt = await booking.book(getHex(ID_COLA), MAP_COLA[0], getHex(start), getHex(end), getHex(idSlot) );
        expectEvent(receipt, 'Book', {
            idCompany: getHex(ID_COLA),
            resourceId: MAP_COLA[0],
            start: getHex(start),
            end: getHex(end),
            idSlot: getHex(idSlot)
        });
    })

    it('should fail to cancel a non existing room', async () => {

        const idSlot = getIdSlot(start, ID_COLA);
      //bytes32  idCompany, bytes32  resourceId, bytes32  start, bytes32  end, uint256 idSlot
      await expectRevert(
          booking.cancel(getHex(ID_COLA), WRONG_ROOM_ID, getHex(start), getHex(end), getHex(idSlot)),
          'revert',
      );
    })



})


const getIdSlot=(start, idCompany) =>{
    return start+eventTitle+idCompany;
}

const getHex = (arg) => {
    return web3.utils.asciiToHex(arg.toString()).padEnd(66, "0");
}

const SimpleStorage = artifacts.require('SimpleStorage');
const {
    BN,
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');



contract('SimpleStorage', (accounts) => {
    const myNumberValue = new BN('100');

    before('setup contract', async () => {
        simpleStorage = await SimpleStorage.new();
    })

    it('should set', async () => {
        user1 = accounts[1];
        const receipt = await simpleStorage.set(myNumberValue);
        expectEvent(receipt, 'Done', {
            value: myNumberValue
        });
    })

})
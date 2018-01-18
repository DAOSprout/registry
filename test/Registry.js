import assertRevert from './helpers/assertRevert'

var Registry = artifacts.require('Registry.sol')

// Remove padding from ascii str
let cleanAscii = (str) => web3.toAscii(str).replace(/\u0000/g, '')

contract('Registry', function (accounts) {
  var fee = web3.toWei(1, 'ether')
  let registry

  beforeEach(async function () {
    registry = await Registry.new(fee)
  })

  it('makes us the owner', async function () {
    let owner = await registry.owner()
    assert.equal(owner, accounts[0])
  })

  it('uses the provided fee', async function () {
    let feeRegistry = await registry.feeInWei()
    assert.equal(fee, feeRegistry)
  })

  context('Registration', function () {
    let address = '0x01'
    let name = 'Test stub name'
    let info = 'Test stub info'

    it('register entity when fee is paid', async function () {
      // Should not throw
      await registry.register(address, name, info, {value: fee})
    })

    it('refuses higher fees', async function () {
      await assertRevert(registry.register(address, name, info, {value: fee * 2}))
    })

    it('refuses lower fees', async function () {
      await assertRevert(registry.register(address, name, info, {value: fee / 2}))
    })

    it('returns the correct entry values', async function () {
      await registry.register(address, name, info, {value: fee})

      let allValues = await registry.getEntry(address)
      assert.equal(accounts[0], allValues[0])
      assert.equal(name, cleanAscii(allValues[1]))
      assert.equal(info, cleanAscii(allValues[2]))
    })

    it('cannot overwrite entry', async function () {
      // Simply attempt to register twice the same entry
      await registry.register(address, name, info, {value: fee})
      await assertRevert(registry.register(address, name, info, {value: fee}))
    })

    context('Updates', function () {
      it('refuses access if not entry owner', async function () {
        await registry.register(address, name, info, {value: fee})

        await assertRevert(registry.setName(address, 'Please fail', {from: accounts[1]}))
      })

      it('updates name', async function () {
        await registry.register(address, name, info, {value: fee})
        await registry.setName(address, 'New')

        let newValues = await registry.getEntry(address)

        let newName = newValues[1]
        assert.equal('New', cleanAscii(newName))
      })

      it('updates info', async function () {
        await registry.register(address, name, info, {value: fee})
        await registry.setInfo(address, 'New')

        let newValues = await registry.getEntry(address)

        let newInfo = newValues[2]
        assert.equal('New', cleanAscii(newInfo))
      })

      it('transfer ownership', async function () {
        await registry.register(address, name, info, {value: fee})
        await registry.transferEntryOwnership(address, accounts[1])

        let newValues = await registry.getEntry(address)

        let newOwner = newValues[0]
        assert.equal(accounts[1], newOwner)

        // We ain't the owner anymore
        await assertRevert(registry.setName(address, 'Fail'))

        // He is
        await registry.setName(address, 'Success', {from: accounts[1]})
      })
    })
  })

  context('Administration', function () {
    it('let the owner update the fee', async function () {
      await registry.updateFee(200)

      let newFee = await registry.feeInWei()
      assert.equal(200, newFee)
    })

    it('moves fees collected', async function () {
      // Send some $$$
      await registry.register('0x0', 'name', 'info', {value: fee})

      // Check balance
      let balance = await web3.eth.getBalance(registry.address)
      assert.equal(fee, balance)

      // Save ours
      let myBalance = await web3.eth.getBalance(accounts[0])

      // Empty
      await registry.withdrawFees()

      // New balance must be empty
      balance = await web3.eth.getBalance(registry.address)
      assert.equal(0, balance)

      // Ours should increase
      let myNewBalance = await web3.eth.getBalance(accounts[0])
      assert(myNewBalance > myBalance)
    })

    it('refuses access to non owner', async function () {
      await assertRevert(registry.updateFee(300, {from: accounts[1]}))
      await assertRevert(registry.withdrawFees({from: accounts[1]}))
    })
  })
})

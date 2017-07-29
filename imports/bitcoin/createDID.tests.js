/* global describe, it */

import {assert} from 'chai'
import {Meteor} from 'meteor/meteor'
import getDeterministicDDO from '/imports/bitcoin/getDeterministicDDO'

import {
  createTestDID,
  createTestHDWallet,
  getFirstOwnerPubKey,
  getFirstClaimsPubKey,
  getFirstControlAddress,
 // getTestDDO,
  testNetwork,
  testRecoveryAddress
} from '/imports/bitcoin/testUtils'

global.Buffer = global.Buffer || require('buffer').Buffer
const bitcoin = require('bitcoinjs-lib')

if (Meteor.isClient) {
  describe('createDID', function () {
    this.timeout(150000)
    it('should create a new DID', async function () {
      const network = testNetwork
      const recoveryAddress = testRecoveryAddress
      const walletRoot = createTestHDWallet(network)
      const {firstTx, secondTx} = await createTestDID({walletRoot, network, recoveryAddress})
      assert.isObject(firstTx, 'First transaction is an object')
      assert.isObject(secondTx, 'Second transaction is an object')
      assert.instanceOf(firstTx, bitcoin.Transaction,
        'First transation is an instance of Transaction')
      assert.instanceOf(secondTx, bitcoin.Transaction,
        'Second transaction is an instance of Transaction')
      assert.equal(firstTx.outs.length, 2, 'First transaction has two outputs')
      assert.equal(secondTx.ins.length, 1, 'Second transaction has one input')
      assert.equal(secondTx.outs.length, 3, 'Second transaction has three outputs')
      const {ownerPubKey, conAddress, nullData, recAddress} = getDeterministicDDO({tx: secondTx, network})
      const extendedDdoHash = bitcoin.script.nullData.output.decode(nullData).toString()
      const extendedDdoJSON = await Meteor.callPromise('ipfs.get', extendedDdoHash)
      const {owner: {publicKey: claimsPubKey}} = JSON.parse(extendedDdoJSON)
      const firstClaimsPubKey = getFirstClaimsPubKey(walletRoot)
      const firstOwnerPubKey = getFirstOwnerPubKey(walletRoot)
      assert.equal(claimsPubKey, firstClaimsPubKey,
        'the owner key in the transaction must be equal to the one provided')
      const controlAddress = getFirstControlAddress(walletRoot)
      assert.equal(conAddress, controlAddress,
        'the control address in the transaction must be equal to the one provided')
      assert.equal(recAddress, recoveryAddress,
        'the recovery address in the transaction must be equal to the one provided')
      assert.deepEqual(firstOwnerPubKey, ownerPubKey,
        'the owner pubkey in the transaction must be equal to the one provided')
    })
  })
}

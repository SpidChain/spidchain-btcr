/* global describe, it */

import {assert} from 'chai'
import {Meteor} from 'meteor/meteor'
import getDeterministicDDO from '/imports/bitcoin/DeterministicDDO'
import {getExtendedDDO} from '/imports/bitcoin/ExtendedDDO'

import {
  createTestDID,
  createTestHDWallet,
  getFirstOwnerPubKey,
  getFirstClaimsPubKey,
  getFirstControlAddress,
  testNetwork,
  testRecoveryAddress
} from '/imports/bitcoin/testUtils'

global.Buffer = global.Buffer || require('buffer').Buffer
const bitcoin = require('bitcoinjs-lib')

if (Meteor.isClient) {
  describe('makeDIDTxs', function () {
    this.timeout(150000)
    it('should create a new DID', async function () {
      const network = testNetwork
      const recoveryAddress = testRecoveryAddress
      const walletRoot = createTestHDWallet(network)
      const {tx1, tx2} = await createTestDID({walletRoot, recoveryAddress})
      assert.isObject(tx1, 'First transaction is an object')
      assert.isObject(tx2, 'Second transaction is an object')
      assert.instanceOf(tx1, bitcoin.Transaction,
        'First transation is an instance of Transaction')
      assert.instanceOf(tx2, bitcoin.Transaction,
        'Second transaction is an instance of Transaction')
      assert.equal(tx1.outs.length, 2, 'First transaction has two outputs')
      assert.equal(tx2.ins.length, 1, 'Second transaction has one input')
      assert.equal(tx2.outs.length, 3, 'Second transaction has three outputs')
      const {ownerPubKey, conAddress, extendedDDOUrl, recAddress} = getDeterministicDDO({tx: tx2, network})
      const {owner: {publicKey: claimsPubKey}} = await getExtendedDDO(extendedDDOUrl)
      /*
      const extendedDdoHash = bitcoin.script.nullData.output.decode(nullData).toString()
      const extendedDdoJSON = await Meteor.callPromise('ipfs.get', extendedDdoHash)
      const {owner: {publicKey: claimsPubKey}} = JSON.parse(extendedDdoJSON)
      */
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

/* global describe, it */

import {assert} from 'chai'
import {Meteor} from 'meteor/meteor'

import {
  createTestDID,
  createTestHDWallet,
  getFirstOwnerPubKey,
  getFirstControlAddress,
  getTestDDO,
  testNetwork,
  testRecoveryAddress
} from '/imports/bitcoin/testUtils'

global.Buffer = global.Buffer || require('buffer').Buffer
const bitcoin = require('bitcoinjs-lib')

if (Meteor.isClient) {
  describe('createDID', function () {
    it('should create a new DID', async function () {
      const network = testNetwork
      const recoveryAddress = testRecoveryAddress
      const walletRoot = createTestHDWallet(network)
      const didTx = await createTestDID({walletRoot, network, recoveryAddress})
      assert.isObject(didTx, 'DID is an object')
      assert.instanceOf(didTx, bitcoin.Transaction, 'DID is instance of Transaction')
      assert.equal(didTx.outs.length, 4, 'DID has four outputs')
      const {nulldata, conAddress, recAddress} = getTestDDO({didTx, network})
      const ddoHash = bitcoin.script.nullData.output.decode(nulldata).toString()
      const ddoJSON = await Meteor.callPromise('ipfs.get', ddoHash)
      const ddo = JSON.parse(ddoJSON)
      const ownerPubKey = getFirstOwnerPubKey(walletRoot)
      assert.equal(ddo.owner[0].publicKey, ownerPubKey,
        'the owner key in the transaction must be equal to the one provided')
      const controlAddress = getFirstControlAddress(walletRoot)
      assert.equal(conAddress, controlAddress,
        'the control address in the transaction must be equal to the one provided')
      assert.equal(recAddress, recoveryAddress,
        'the recovery address in the transaction must be equal to the one provided')
    })
  })
}

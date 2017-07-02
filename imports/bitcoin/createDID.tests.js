/* global describe, it */

import {assert} from 'chai'
import {Meteor} from 'meteor/meteor'

import {
  createTestDID,
  createTestHDWallet,
  getFirstSignatureAddress,
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
      assert.equal(didTx.outs.length, 3, 'DID has two outputs')
      const {sigAddress, recAddress} = getTestDDO({didTx, network})
      const signatureAddress = getFirstSignatureAddress(walletRoot)
      assert.equal(sigAddress, signatureAddress,
        'the control address in the transaction must be equal to the one provided')
      assert.equal(recAddress, recoveryAddress,
        'the recovery address in the transaction must be equal to the one provided')
    })
  })
}

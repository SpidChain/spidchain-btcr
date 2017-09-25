/* global describe, it */

import {assert} from 'chai'
import {Meteor} from 'meteor/meteor'

import {
  createTestDID,
  createTestHDWallet,
  testRecoveryAddress
} from 'bitcoin/testUtils'
import {sendRawTransaction} from 'bitcoin/bitcoinRpc'
import signWithOwnerKey256 from 'bitcoin/sign'
import verifyWithOwnerKey256 from 'bitcoin/verify'

global.Buffer = global.Buffer || require('buffer').Buffer

if (Meteor.isClient) {
  describe('verify', function () {
    it('it verifies a message signature', async function () {
      this.timeout(150000)
      const walletRoot = createTestHDWallet()
      const recoveryAddress = testRecoveryAddress
      const {tx1, tx2} = await createTestDID({walletRoot, recoveryAddress})
      await sendRawTransaction(tx1.toHex())
      await sendRawTransaction(tx2.toHex())
      const msg = 'Hello World!'
      const sig = signWithOwnerKey256({walletRoot, msg, rotationIx: 0})
      const res = await verifyWithOwnerKey256({msg, DID: tx1.getId(), sig})
      assert.isTrue(res)
    })
  })
}

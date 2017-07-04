/* global describe, it */

import {assert} from 'chai'
import {Meteor} from 'meteor/meteor'

import {
  createTestDID,
  createTestHDWallet,
  testRecoveryAddress
} from '/imports/bitcoin/testUtils'
import sendRawTransaction from '/imports/bitcoin/sendRawTransaction'
import sign from '/imports/bitcoin/sign'
import verify from './verify'

global.Buffer = global.Buffer || require('buffer').Buffer
const {crypto, networks} = require('bitcoinjs-lib')

const network = networks[Meteor.settings.public.network]

if (Meteor.isClient) {
  describe('verify', function () {
    it('it verifies a message signature', async function () {
      const walletRoot = createTestHDWallet(network)
      const recoveryAddress = testRecoveryAddress
      const didTx = await createTestDID({walletRoot, network, recoveryAddress})
      await sendRawTransaction(didTx.toHex())
      const ownerAccount = 2
      const msg = 'Hello World!'
      const msgHash = crypto.sha256(msg).toString('hex')
      const sig = sign({walletRoot, ownerAccount, msgHash, rotationIx: 0})
      const res = await verify({msgHash, did: didTx.getId(), sig, keyIx: 0})
      assert.isTrue(res)
    })
  })
}

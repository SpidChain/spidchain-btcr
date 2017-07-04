/* global describe, it */

import {assert} from 'chai'
import {Meteor} from 'meteor/meteor'

import {createTestHDWallet} from '/imports/bitcoin/testUtils'
import sign from './sign'

global.Buffer = global.Buffer || require('buffer').Buffer
const {ECSignature, crypto, networks} = require('bitcoinjs-lib')

const network = networks[Meteor.settings.public.network]

if (Meteor.isClient) {
  describe('sign', function () {
    it('it signs a message with my current signing key', function () {
      const walletRoot = createTestHDWallet(network)
      const ownerAccount = 1
      const msg = 'Hello World!'
      const msgHash = crypto.sha256(msg).toString('hex')
      const sig = sign({walletRoot, ownerAccount, msgHash, rotationIx: 0})
      const owner = walletRoot.derivePath("m/44'/0'")
        .deriveHardened(ownerAccount)
        .derive(0)
        .derive(0)
      assert.isTrue(owner.verify(
        Buffer.from(msgHash, 'hex'),
        ECSignature.fromDER(Buffer.from(sig, 'hex'))
      ))
    })
  })
}

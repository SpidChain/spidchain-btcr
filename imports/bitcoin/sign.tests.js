/* global describe, it */

import {assert} from 'chai'
import {Meteor} from 'meteor/meteor'

import {createTestHDWallet} from '/imports/bitcoin/testUtils'
import sign256 from './sign'

global.Buffer = global.Buffer || require('buffer').Buffer
const {ECSignature, crypto} = require('bitcoinjs-lib')

if (Meteor.isClient) {
  describe('sign', function () {
    it('it signs a message with my current signing key', function () {
      this.timeout(150000)
      const walletRoot = createTestHDWallet()
      const msg = 'Hello World!'
      const sig = sign256({walletRoot, msg, rotationIx: 0})
      const owner = walletRoot.derivePath("m/44'/0'")
        .deriveHardened(Meteor.settings.public.controlAccount)
        .derive(0)
        .derive(0)
      const msgHash = crypto.sha256(msg)
      assert.isTrue(owner.verify(msgHash, ECSignature.fromDER(Buffer.from(sig, 'hex'))
      ))
    })
  })
}

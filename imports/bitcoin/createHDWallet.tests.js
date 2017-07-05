/* global describe, it */

import {assert} from 'chai'
import {Meteor} from 'meteor/meteor'

import createHDWallet from './createHDWallet'

global.Buffer = global.Buffer || require('buffer').Buffer
const {HDNode, networks} = require('bitcoinjs-lib')

const network = networks[Meteor.settings.public.network]

if (Meteor.isClient) {
  describe('createHDWallet', function () {
    it('it should create an HD wallet from a mnemonic', function () {
      const mnemonic = 'praise you muffin lion enable neck grocery crumble super myself license ghost'
      const rootBase58 = createHDWallet(mnemonic)

      const root = HDNode.fromBase58(rootBase58, network)
      const path = "m/44'/0'/0'/0/0"
      const child1 = root.derivePath(path)

      assert.equal(child1.getAddress(), 'n3rAiPfb3mbqMpzQPNhs3WJ2NpYEtHS3Mw')
    })
  })
}

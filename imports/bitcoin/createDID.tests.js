/* global describe, it */

import {assert} from 'chai'
import {Meteor} from 'meteor/meteor'

import createHDWallet from './createHDWallet'
import createDID from './createDID'

global.Buffer = global.Buffer || require('buffer').Buffer
const bip39 = require('bip39')
const bitcoin = require('bitcoinjs-lib')

if (Meteor.isClient) {
  describe('createDID', function () {
    it('it should create a new DID', function () {
      const identityAccount = 1
      const mnemonic = 'praise you muffin lion enable neck grocery crumble super myself license ghost'
      const seed = bip39.mnemonicToSeed(mnemonic)
      const root = bitcoin.HDNode.fromSeedBuffer(seed)
      const did = createDID(identityAccount, root)
      assert.isObject(did, 'DID is an object')
      assert.instanceOf(did, bitcoin.Transaction, 'DID is instance of Transaction')
      assert.equal(did.outs.length, 2, 'DID has two outputs')
    })
  })
}

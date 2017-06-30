/* global describe, it */

import {assert} from 'chai'
import {Meteor} from 'meteor/meteor'

import createDID from './createDID'

global.Buffer = global.Buffer || require('buffer').Buffer
const bip39 = require('bip39')
const bitcoin = require('bitcoinjs-lib')

const network = bitcoin.networks.testnet

const createTestKeypair = async () => {
  const address = await Meteor.callPromise('bitcoin', 'getNewAddress')
  await Meteor.callPromise('bitcoin', 'sendToAddress', address, 1)
  const privateKey = await Meteor.callPromise('bitcoin', 'dumpPrivKey', address)
  // this can be omitted because I take utxos with zero confirms
  // await Meteor.callPromise('bitcoin', 'generate', 10)
  return bitcoin.ECPair.fromWIF(privateKey, network)
}

if (Meteor.isClient) {
  describe('createDID', function () {
    it('it should create a new DID', async function (done) {
      const mnemonic = 'praise you muffin lion enable neck grocery crumble super myself license ghost'
      const seed = bip39.mnemonicToSeed(mnemonic)
      const walletRoot = bitcoin.HDNode.fromSeedBuffer(seed, network)
      let fundingKeypair
      try {
        fundingKeypair = await createTestKeypair()
      } catch (e) {
        console.error(e)
      }
      const fundingAddress = fundingKeypair.getAddress()
      const recoveryAddress = 'mgkbNPFpgkgPFLibMzVCPq3f64WB3WhExN'
      const amount = 1000
      const utxos = await Meteor.callPromise('bitcoin', 'listUnspent', 0, 9999999,
        [fundingAddress])
      const did = await createDID({
        identityAccount: 1,
        walletRoot,
        fundingKeypair,
        amount,
        recoveryAddress,
        utxos})
      assert.isObject(did, 'DID is an object')
      assert.instanceOf(did, bitcoin.Transaction, 'DID is instance of Transaction')
      assert.equal(did.outs.length, 3, 'DID has two outputs')
      const [{script: sigScript}, {script: recScript}] = did.outs
      const sigAddress = bitcoin.address.fromOutputScript(sigScript, network)
      const identityRoot = walletRoot.derivePath("m/44'/0'/1'/0")
      const signatureKeyPair = identityRoot.derive(0)
      const signatureAddress = signatureKeyPair.getAddress()
      assert.equal(sigAddress, signatureAddress)
      const recAddress = bitcoin.address.fromOutputScript(recScript, network)
      assert.equal(recAddress, recoveryAddress)
      done()
    })
  })
}

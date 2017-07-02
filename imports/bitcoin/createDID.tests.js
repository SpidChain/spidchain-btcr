/* global describe, it */

import {assert} from 'chai'
import {Meteor} from 'meteor/meteor'

import createDID from './createDID'

global.Buffer = global.Buffer || require('buffer').Buffer
const bip39 = require('bip39')
const bitcoin = require('bitcoinjs-lib')

/** The network used for tests */

const testNetwork = bitcoin.networks.testnet

/** A sample testnet address without a corresponding privateKey */

const testRecoveryAddress = 'mgkbNPFpgkgPFLibMzVCPq3f64WB3WhExN'

/** Returns a keypair for the testnet/regtest with 1 BTC value in it */

const createTestKeypair = async (network) => {
  const address = await Meteor.callPromise('bitcoin', 'getNewAddress')
  await Meteor.callPromise('bitcoin', 'sendToAddress', address, 1)
  const privateKey = await Meteor.callPromise('bitcoin', 'dumpPrivKey', address)
  // this can be omitted because I take utxos with zero confirms
  // await Meteor.callPromise('bitcoin', 'generate', 10)
  return bitcoin.ECPair.fromWIF(privateKey, network)
}

/** Returns and HDWallet for the given network, for testing purposes */

const createTestHDWallet = (network) => {
  const mnemonic = 'praise you muffin lion enable neck grocery crumble super myself license ghost'
  const seed = bip39.mnemonicToSeed(mnemonic)
  const walletRoot = bitcoin.HDNode.fromSeedBuffer(seed, network)
  return walletRoot
}

/** returns a new DID for testing uses */

const createTestDID = async ({network, walletRoot, recoveryAddress}) => {
  const fundingKeypair = await createTestKeypair(network)
  const fundingAddress = fundingKeypair.getAddress()
  const amount = 1000
  const utxos = await Meteor.callPromise('bitcoin', 'listUnspent', 0, 9999999,
    [fundingAddress])
  const didTx = await createDID({
    identityAccount: 1,
    walletRoot,
    fundingKeypair,
    amount,
    recoveryAddress,
    utxos})
  return didTx
}

/** Return the first keypair from a HDWallet */

const getFirstSignatureAddress = (walletRoot) => {
  const identityRoot = walletRoot.derivePath("m/44'/0'/1'/0")
  const signatureKeyPair = identityRoot.derive(0)
  const signatureAddress = signatureKeyPair.getAddress()
  return signatureAddress
}

/** Return a partial DDO for given DID, should be refactored once we write getDDO */

const getTestDDO = ({didTx, network}) => {
  const [{script: sigScript}, {script: recScript}] = didTx.outs
  const sigAddress = bitcoin.address.fromOutputScript(sigScript, network)
  const recAddress = bitcoin.address.fromOutputScript(recScript, network)
  return {sigAddress, recAddress}
}

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

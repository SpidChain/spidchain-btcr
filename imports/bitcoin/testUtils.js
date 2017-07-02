import {Meteor} from 'meteor/meteor'

import createDID from './createDID'
import ddo from '/imports/bitcoin/ddo'

global.Buffer = global.Buffer || require('buffer').Buffer
const bip39 = require('bip39')
const bitcoin = require('bitcoinjs-lib')

/** The network used for tests */

export const testNetwork = bitcoin.networks.testnet

/** A sample testnet address without a corresponding privateKey */

export const testRecoveryAddress = 'mgkbNPFpgkgPFLibMzVCPq3f64WB3WhExN'

/** Returns a keypair for the testnet/regtest with 1 BTC value in it */

export const createTestKeypair = async (network) => {
  const address = await Meteor.callPromise('bitcoin', 'getNewAddress')
  await Meteor.callPromise('bitcoin', 'sendToAddress', address, 1)
  const privateKey = await Meteor.callPromise('bitcoin', 'dumpPrivKey', address)
  // this can be omitted because I take utxos with zero confirms
  // await Meteor.callPromise('bitcoin', 'generate', 10)
  return bitcoin.ECPair.fromWIF(privateKey, network)
}

/** Returns and HDWallet for the given network, for testing purposes */

export const createTestHDWallet = (network) => {
  const mnemonic = 'praise you muffin lion enable neck grocery crumble super myself license ghost'
  const seed = bip39.mnemonicToSeed(mnemonic)
  const walletRoot = bitcoin.HDNode.fromSeedBuffer(seed, network)
  return walletRoot
}

/** returns a new DID for testing uses */

export const createTestDID = async ({network, walletRoot, recoveryAddress}) => {
  const fundingKeypair = await createTestKeypair(network)
  const fundingAddress = fundingKeypair.getAddress()
  const amount = 1000
  const utxos = await Meteor.callPromise('bitcoin', 'listUnspent', 0, 9999999,
    [fundingAddress])
  const ownerRoot = walletRoot.derivePath("m/44'/0'")
    .deriveHardened(2)
    .derive(0)
  const ownerKeyPair = ownerRoot.derive(0)
  const ownerPubKey = ownerKeyPair.getPublicKeyBuffer().toString('hex')
  const ddoData = ddo({pubKeys: [ownerPubKey]})
  const ddoJSON = JSON.stringify(ddoData)
  const [{hash: ddoHash}] = await Meteor.callPromise('ipfs.add', ddoJSON)
  const didTx = await createDID({
    controlAccount: 1,
    ddoHash,
    walletRoot,
    fundingKeypair,
    amount,
    recoveryAddress,
    utxos})
  return didTx
}

/** Return the first keypair from a HDWallet */

export const getFirstOwnerPubKey = (walletRoot) => {
  const ownerRoot = walletRoot.derivePath("m/44'/0'/2'/0")
  const ownerKeyPair = ownerRoot.derive(0)
  return ownerKeyPair.getPublicKeyBuffer().toString('hex')
}

export const getFirstControlAddress = (walletRoot) => {
  const controlRoot = walletRoot.derivePath("m/44'/0'/1'/0")
  const controlKeyPair = controlRoot.derive(0)
  const controlAddress = controlKeyPair.getAddress()
  return controlAddress
}

/** Return a partial DDO for given DID, should be refactored once we write getDDO */

export const getTestDDO = ({didTx, network}) => {
  const [{script: nulldata}, {script: conScript}, {script: recScript}] = didTx.outs
  const conAddress = bitcoin.address.fromOutputScript(conScript, network)
  const recAddress = bitcoin.address.fromOutputScript(recScript, network)
  return {nulldata, conAddress, recAddress}
}

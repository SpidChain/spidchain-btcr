import {Meteor} from 'meteor/meteor'

import createDID from './createDID'
// import ddo from '/imports/bitcoin/ddo'

global.Buffer = global.Buffer || require('buffer').Buffer
const bip39 = require('bip39')
const bitcoin = require('bitcoinjs-lib')

/** The network used for tests */

// export const testNetwork = bitcoin.networks.testnet
export const testNetwork = bitcoin.networks[Meteor.settings.public.network]

/** A sample testnet address without a corresponding privateKey */

export const testRecoveryAddress = 'mgkbNPFpgkgPFLibMzVCPq3f64WB3WhExN'

/** Returns a keypair for the testnet/regtest with 1 BTC value in it */

export const createTestKeypair = async () => {
  const address = await Meteor.callPromise('bitcoin', 'getNewAddress')
  await Meteor.callPromise('bitcoin', 'sendToAddress', address, 1)
  const privateKey = await Meteor.callPromise('bitcoin', 'dumpPrivKey', address)
  // this can be omitted because I take utxos with zero confirms
  // await Meteor.callPromise('bitcoin', 'generate', 10)
  return bitcoin.ECPair.fromWIF(privateKey, testNetwork)
}

/** Returns and HDWallet for the given network, for testing purposes */

export const createTestHDWallet = () => {
  const mnemonic = 'praise you muffin lion enable neck grocery crumble super myself license ghost'
  const seed = bip39.mnemonicToSeed(mnemonic)
  const walletRoot = bitcoin.HDNode.fromSeedBuffer(seed, testNetwork)
  return walletRoot
}

/** returns a new DID for testing uses */

export const createTestDID = async ({walletRoot, recoveryAddress}) => {
  const controlAccount = Meteor.settings.public.controlAccount
  const claimsAccount = Meteor.settings.public.claimsAccount
  const controlRoot = walletRoot.derivePath("m/44'/0'")
    .deriveHardened(controlAccount)
    .derive(0)
  const claimsRoot = walletRoot.derivePath("m/44'/0'")
    .deriveHardened(claimsAccount)
    .derive(0)
  const fundingKeypair = await createTestKeypair()
  const fundingAddress = fundingKeypair.getAddress()
  const controlBond = 1000
  const recoveryAmount = 10
  const utxos = await Meteor.callPromise('bitcoin', 'listUnspent', 0, 9999999,
    [fundingAddress])
  /*
  const claimsKeyPair = claimsRoot.derive(0)
  const claimsPubKey = claimsKeyPair.getPublicKeyBuffer().toString('hex')
  const ddoData = ddo({pubKeys: [claimsPubKey]})
  const ddoJSON = JSON.stringify(ddoData)
  const [{hash: ddoHash}] = await Meteor.callPromise('ipfs.add', ddoJSON)
  */
  const didTx = await createDID({
    // walletRoot
    claimsRoot,
    controlBond,
    controlRoot,
    fundingKeypair,
    recoveryAddress,
    recoveryAmount,
    utxos
    // ddoHash,
  })
  return didTx
}

/** Return the first keypair from a HDWallet */

export const getFirstOwnerPubKey = (walletRoot) => {
  const controlAccount = Meteor.settings.public.controlAccount
  const controlRoot = walletRoot.derivePath("m/44'/0'")
    .deriveHardened(controlAccount)
    .derive(0)
  // const ownerRoot = walletRoot.derivePath("m/44'/0'/2'/0")
  const ownerKeyPair = controlRoot.derive(0).keyPair
  return ownerKeyPair.getPublicKeyBuffer()
  // return ownerKeyPair.getPublicKeyBuffer().toString('hex')
}

export const getFirstControlAddress = (walletRoot) => {
  const controlAccount = Meteor.settings.public.controlAccount
  const controlRoot = walletRoot.derivePath("m/44'/0'")
    .deriveHardened(controlAccount)
    .derive(0)
  const controlKeyPair = controlRoot.derive(1).keyPair
  const controlAddress = controlKeyPair.getAddress()
  return controlAddress
}

export const getFirstClaimsPubKey = (walletRoot) => {
  const claimsAccount = Meteor.settings.public.claimsAccount
  const claimsRoot = walletRoot.derivePath("m/44'/0'")
    .deriveHardened(claimsAccount)
    .derive(0)
  const claimsKeyPair = claimsRoot.derive(0)
  return claimsKeyPair.getPublicKeyBuffer().toString('hex')
}

/** Return a partial DDO for given DID, should be refactored once we write getDDO */

/*
export const getTestDDO = ({tx, network}) => {
  const [{script: conScript}, {script: nulldata}, {script: recScript}] = tx.outs
  const ownerPubKey = tx.ins[0].script
  const conAddress = bitcoin.address.fromOutputScript(conScript, network)
  const recAddress = bitcoin.address.fromOutputScript(recScript, network)
  return {ownerPubKey, conAddress, nulldata, recAddress}
}
*/

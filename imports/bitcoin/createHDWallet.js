import {Meteor} from 'meteor/meteor'

global.Buffer = global.Buffer || require('buffer').Buffer
const bip39 = require('bip39')
const {HDNode, networks} = require('bitcoinjs-lib')
const network = networks[Meteor.settings.public.network]

export default (mnemonic) => {
  const seed = bip39.mnemonicToSeed(mnemonic)
  const root = HDNode.fromSeedBuffer(seed, network)
  return root.toBase58()
}

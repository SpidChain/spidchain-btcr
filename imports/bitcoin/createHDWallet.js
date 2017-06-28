global.Buffer = global.Buffer || require('buffer').Buffer
const bip39 = require('bip39')
const bitcoin = require('bitcoinjs-lib')

export default (mnemonic) => {
  const seed = bip39.mnemonicToSeed(mnemonic)
  const root = bitcoin.HDNode.fromSeedBuffer(seed)
  return root.toBase58()
}

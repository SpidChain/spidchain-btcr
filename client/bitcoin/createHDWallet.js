import bip39 from 'bip39'
import {HDNode, networks} from 'bitcoinjs-lib'

const network = networks[process.env.network]

export default (mnemonic) => {
  const seed = bip39.mnemonicToSeed(mnemonic)
  const root = HDNode.fromSeedBuffer(seed, network)
  return root.toBase58()
}

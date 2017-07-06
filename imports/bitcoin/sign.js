global.Buffer = global.Buffer || require('buffer').Buffer
const {crypto} = require('bitcoinjs-lib')

// hashFunction must return a Buffer

const sign = hashFunction => ({ownerAccount, walletRoot, msg, rotationIx}) => {
  const ownerRoot = walletRoot.derivePath("m/44'/0'")
    .deriveHardened(ownerAccount)
    .derive(0)
  return ownerRoot.derive(rotationIx)
    .sign(hashFunction(msg)).toDER().toString('hex')
}

const sha256 = msg => crypto.sha256(msg)

const sign256 = sign(sha256)

export default sign256

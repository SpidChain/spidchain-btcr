global.Buffer = global.Buffer || require('buffer').Buffer
const {crypto} = require('bitcoinjs-lib')

// hashFunction must return a Buffer

const signWithOwnerKey = hashFunction => ({walletRoot, msg, rotationIx}) => {
  const controlAccount = Number(process.env.controlAccount)
  const ownerRoot = walletRoot.derivePath("m/44'/0'")
    .deriveHardened(controlAccount)
    .derive(0)
  return ownerRoot.derive(rotationIx)
    .sign(hashFunction(msg)).toDER().toString('hex')
}

const sha256 = msg => crypto.sha256(msg)

const signWithOwnerKey256 = signWithOwnerKey(sha256)

export default signWithOwnerKey256

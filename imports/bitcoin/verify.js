import resolveDID from '/imports/bitcoin/resolveDID'

global.Buffer = global.Buffer || require('buffer').Buffer
const {ECPair, ECSignature, crypto} = require('bitcoinjs-lib')

const sha256 = msg => crypto.sha256(msg)

const verify = hashFunction => async ({did, msg, sig, keyIx}) => {
  const ddo = await resolveDID(did)
  const owner = ddo.owner[keyIx]

  if (!owner) {
    return false
  }

  const pubKey = owner.publicKey
  const keyPair = ECPair.fromPublicKeyBuffer(Buffer.from(pubKey, 'hex'))
  return keyPair.verify(
    hashFunction(msg),
    ECSignature.fromDER(Buffer.from(sig, 'hex'))
  )
}

const verify256 = verify(sha256)

export default verify256

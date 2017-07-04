import resolveDID from '/imports/bitcoin/resolveDID'

global.Buffer = global.Buffer || require('buffer').Buffer
const {ECPair, ECSignature} = require('bitcoinjs-lib')

export default async ({did, msgHash, sig, keyIx}) => {
  const ddo = await resolveDID(did)
  const owner = ddo.owner[keyIx]

  if (!owner) {
    return false
  }

  const pubKey = owner.publicKey
  const keyPair = ECPair.fromPublicKeyBuffer(Buffer.from(pubKey, 'hex'))
  return keyPair.verify(
    Buffer.from(msgHash, 'hex'),
    ECSignature.fromDER(Buffer.from(sig, 'hex'))
  )
}

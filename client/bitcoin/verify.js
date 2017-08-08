import {getDDO} from 'bitcoin/DDO'

global.Buffer = global.Buffer || require('buffer').Buffer
const {ECPair, ECSignature, crypto} = require('bitcoinjs-lib')

const sha256 = msg => crypto.sha256(msg)

const verifyWithOwnerKey = hashFunction => async ({DID, msg, sig}) => {
  const {deterministicDDO: {ownerPubKey}} = await getDDO(DID)
  const keyPair = ECPair.fromPublicKeyBuffer(Buffer.from(ownerPubKey, 'hex'))
  return keyPair.verify(
    hashFunction(msg),
    ECSignature.fromDER(Buffer.from(sig, 'hex'))
  )
}

const verifyWithOwnerKey256 = verifyWithOwnerKey(sha256)

export default verifyWithOwnerKey256

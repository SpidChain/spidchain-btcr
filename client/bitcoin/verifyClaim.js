// TODO: find a better way to import bitcore-message
import bitcoreMessage from 'jsonld-signatures/node_modules/bitcore-message'
import jsigs from 'jsonld-signatures'
import jsonld from 'jsonld'

jsigs.use('bitcoreMessage', bitcoreMessage)
jsigs.use('jsonld', jsonld)

const verifyClaim = (signedDocument, did, keyId, publicKey) => jsigs.promises().verify(signedDocument, {
  publicKey: {
    '@context': jsigs.SECURITY_CONTEXT_URL,
    id: keyId,
    type: 'CryptographicKey',
    owner: did,
    publicKeyWif: publicKey
  },
  publicKeyOwner: {
    '@context': jsigs.SECURITY_CONTEXT_URL,
    id: did,
    publicKey: [keyId]
  }
})

export default verifyClaim

// TODO: find a better way to import bitcore-message
import bitcoreMessage from 'jsonld-signatures/node_modules/bitcore-message'
import jsigs from 'jsonld-signatures'
import jsonld from 'jsonld'
import {ECPair, networks} from 'bitcoinjs-lib'

import {getDDO} from 'bitcoin/DDO'

jsigs.use('bitcoreMessage', bitcoreMessage)
jsigs.use('jsonld', jsonld)

const network = networks[process.env.network]

// TODO Put back keyId in the arguments list
export const verifyClaim = async ({signedDocument, signerDid}) => {
  const {deterministicDDO: {ownerPubKey}} = await getDDO(signerDid)
  const keyPair = ECPair.fromPublicKeyBuffer(Buffer.from(ownerPubKey, 'hex'), network)
  const publicKeyWif = keyPair.getAddress()
  const res = await jsigs.promises().verify(signedDocument, {
    publicKey: {
      '@context': jsigs.SECURITY_CONTEXT_URL,
      //   id: keyId,
      id: 'did:btcr:' + signerDid,
      type: 'CryptographicKey',
      owner: 'did:btcr:' + signerDid,
      publicKeyWif
    },
    publicKeyOwner: {
      '@context': jsigs.SECURITY_CONTEXT_URL,
      id: 'did:btcr:' + signerDid,
      // publicKey: [keyId]
      publicKey: ['did:btcr:' + signerDid]
    }
  })
  return res.keyResults[0].verified
}

export default verifyClaim

// TODO: find a better way to import bitcore-message
import bitcoreMessage from 'jsonld-signatures/node_modules/bitcore-message'
import jsigs from 'jsonld-signatures'
import jsonld from 'jsonld'

jsigs.use('bitcoreMessage', bitcoreMessage)
jsigs.use('jsonld', jsonld)

const algorithm = 'EcdsaKoblitzSignature2016'

const signClaim = ({claim, ownerRoot, rotationIx, did}) => jsigs.promises().sign(claim, {
  algorithm,
  // creator: `ecdsa-koblitz-pubkey:${ownerRoot.derive(rotationIx).getAddress()}`,
  creator: 'did:btcr:' + did,
  privateKeyWif: ownerRoot.derive(rotationIx).keyPair.toWIF()
})

export default signClaim

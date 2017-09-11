// https://raw.githubusercontent.com/christophera/self/master/ddo.jsonld
//
/*
{
  "@context": [
    "https://schema.org/",
    "https://w3id.org/security/v1"
  ],
  "id": "did:btcr:xyv2-xzyq-qqm5-tyke/0#christophera-self-signed-claim",
  "type": [
    "Credential",
    "Identity",
    "Person"
  ],
  "issuer": "did:btcr:xyv2-xzyq-qqm5-tyke/0#did-transaction-key",
  "issued": "2017-07-15",
  "label": "christophera-self-signed-claim",
  "claim": {
    "relationship": "me",
    "alternate-name": "ChristopherA",
    "sameAs": [
      "https://raw.githubusercontent.com/ChristopherA/self/master/357405ED.asc",
      "https://raw.githubusercontent.com/ChristopherA/self/master/FDA6C78E.asc",
      "https://github.com/christophera",
      "https://twitter.com/christophera"
    ]
  },
  "signature": {
    "type": "EcdsaKoblitzSignature2016",
    "created": "2017-07-16T00:48:44Z",
    "creator": "ecdsa-koblitz-pubkey:02b97c30de767f084ce3080168ee293053ba33b235d7116a3263d29f1450936b71",
    "signatureValue": "HyV/c/DFdAigxSAuqE9O6yRqUk5wpobUaj63ig3hZMZxKJ/l2lNduWFKsN6aR5twAFurD3pJx2ZgVpu/fRb/lLo="
  }
}
*/

import {crypto} from 'bitcoinjs-lib'

import {ipfsAdd, ipfsGet} from 'bitcoin/ipfsRpc'

const sha256 = msg => crypto.sha256(msg)

// This should be generic, checking the type of URL (ipfs, github, drive...)
// and does the appropriet get request
export const getExtendedDDO = async (extendedDDOUrl) => {
  const extendedDDOJSON = await ipfsGet(extendedDDOUrl)
  return JSON.parse(extendedDDOJSON)
}

export const makeExtendedDDO = async ({DID, claimsKeyPair, ownerKeyPair}) => {
  // const controlKeyPair = controlRoot.derive(0)
  // const claimsKeyPair = claimsRoot.derive(0)
  // const claimsPubKeys = [claimsKeyPair.getPublicKeyBuffer().toString('hex')]
  const ExtendedDDO = assembleExtendedDDO({DID, ownerKeyPair, claimsKeyPair})
  const extendedDDOJSON = JSON.stringify(ExtendedDDO)
  const [{hash}] = await ipfsAdd(extendedDDOJSON)
  return hash
}

const makeDID = (txId) => {
  return `did:btcr:${txId}`
}

const assembleExtendedDDO = ({DID, ownerKeyPair, claimsKeyPair}) => {
  const did = makeDID(DID)
  const owner = {
    id: `${did}#key-1`,
    type: ['CryptographicKey', 'EcDsaPublicKey'],
    curve: 'secp256k1',
    publicKey: claimsKeyPair.getPublicKeyBuffer().toString('hex')
  }
  const timeStamp = new Date().toDateString()
  const ddo = {
    '@context': [
      'https://schema.org/',
      'https://w3id.org/security/v1'
    ],
    issuer: did,
    issued: timeStamp,
    type: [
      'Credential',
      'Identity',
      'Person'
    ],
    owner
  }
  const ddoJSON = JSON.stringify(ddo)
  const ddoHash = sha256(ddoJSON)
  const ddoSignature = ownerKeyPair.sign(ddoHash).toDER().toString('hex')
  return {
    ...ddo,
    ddoSignature
  }
}

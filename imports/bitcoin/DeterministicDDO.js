/*
// Christopher Allen
{
    "@context":
    [
        "https://schema.org/",
        "https://w3id.org/security/v1"
    ],
    "ddo": // basically info that be deterministically created from the transaction alone
    {
        "txid": "f8cdaff3ebd9e862ed5885f8975489090595abe1470397f79780ead1c7528107",
        "funding-txid": "a2cb61283814f8e758f138260da0cccd367c43afead5458e13a7d058f5bc3f6a", //optional
        "funding-txref": "x?" //optional
        "hash": "f8cdaff3ebd9e862ed5885f8975489090595abe1470397f79780ead1c7528107", // normall same as txid but only needed for witness as it may be different from txid
        "more-ddo-hex": "6a4568747470733a2f2f7261772e67697468756275736572636f6e74656e742e636f6d2f4368726973746f70686572412f73656c662f6d61737465722f64646f2e6a736f6e6c64",
        "more-ddo-asm": "OP_RETURN 68747470733a2f2f7261772e67697468756275736572636f6e74656e742e636f6d2f4368726973746f70686572412f73656c662f6d61737465722f64646f2e6a736f6e6c64",
        "more-ddo-txt": "https://github.com/ChristopherA/self/blob/master/ddo.jsonld",
        {
            "owner": [{
            "type": "update-proof"
            "id": "did:example:21tDAKCERh95uGgKbJNHYp#key-1",
            "type": ["CryptographicKey", "EdDsaSAPublicKey"],
            "curve": "secp256k1",
            "publicKeyHex": "02b97c30de767f084ce3080168ee293053ba33b235d7116a3263d29f1450936b71"
            }]
        }
        {
          "control":
          [{
              "control-bond": 1.25
              "rotate-proof": [{
                  "proof-type": "pubkeyhash",
                  "hash-base58check": "mvZ3MyLgsvYr87GGSbsPBWEDduLRptfzEU"
                  }]
            },{
            "revocation-proof": [{
                "proof-type": "pubkeyhash",
                "hash-base58check": "mvZ3MyLgsvYr87GGSbsPBWEDduLRptfzEU"
          }]
        }

    },
    "signature":
    {
        "type": "SatoshiBlockchainSignature2017",
        "id": "x?????" // the txref
        "chain": "testnet3",
        "blockhash": "00000000b3487880b2814da8c0a6b545453d88945dc29a7b700f653cd7e9cdc7",
        "blockindex": 1,
        "blocktime": 1499502050,
        "confirmations": 644,
        "time": 1499501000,
        "timereceived": 1499501000,
        "burn-fee": -0.05
    }
}
*/
import {Meteor} from 'meteor/meteor'
global.Buffer = global.Buffer || require('buffer').Buffer
const bitcoin = require('bitcoinjs-lib')

// getDeterministicDDO

// TxToDDO
const getDeterministicDDO = (tx) => {
  const network = bitcoin.networks[Meteor.settings.public.network]
  const inputScript = tx.ins[0].script
  const [{script: conScript}, {script: nullData}, {script: recScript}] = tx.outs
  const ownerPubKey = bitcoin.script.pubKeyHash.input.decode(inputScript).pubKey
  const conAddress = bitcoin.address.fromOutputScript(conScript, network)
  const recAddress = bitcoin.address.fromOutputScript(recScript, network)
  const extendedDDOUrl = bitcoin.script.nullData.output.decode(nullData).toString()
  return {ownerPubKey, conAddress, extendedDDOUrl, recAddress}
  /*
  return {
    '@context':
    [
      'https://schema.org/',
      'https://w3id.org/security/v1'
    ],
    ddo: {
      owner: [{
        type: 'update-proof',
        // id: "did:example:21tDAKCERh95uGgKbJNHYp#key-1",
        'proof-type': ['CryptographicKey', 'EcDsaPublicKey'],
        curve: 'secp256k1',
        publicKeyHex: ownerPubKey
      }],
      control: [{
        // 'control-bond': 1.25
        'rotate-proof': [{
          'proof-type': 'pubkeyhash',
          'hash-base58check': conAddress
        }]
      }, {
        'revocation-proof': [{
          'proof-type': 'pubkeyhash',
          'hash-base58check': conAddress
        }]
      }]
    },
    'signature': {
      type: 'SatoshiBlockchainSignature2017'
      // id: "x?????" // the txref
      // chain: 'testnet3',
      // blockhash: '00000000b3487880b2814da8c0a6b545453d88945dc29a7b700f653cd7e9cdc7',
      // blockindex: 1,
      // blocktime: 1499502050,
      // confirmations: 644,
      // time: 1499501000,
      // timereceived: 1499501000,
      // 'burn-fee': -0.05
    }
  }
*/
}

export default getDeterministicDDO

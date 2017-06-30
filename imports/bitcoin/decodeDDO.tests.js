/* global describe, it */

import {assert} from 'chai'
import {Meteor} from 'meteor/meteor'

import decodeDDO from './decodeDDO'

global.Buffer = global.Buffer || require('buffer').Buffer
const bitcoin = require('bitcoinjs-lib')

if (Meteor.isClient) {
  describe('decodeDDO', function () {
    it('it should decode a DDO transaction into JSON', function () {
      const signingAddress = '1KgeF4uERV9R3Wo9KixVj3EGtd5ufS8H3P'
      const recoveryAddress = '1JXWGfpdNSX3VDnCh3MRi7N3UwS7Lu1ASH'
      const amount = 5000
      const inputKeyPair = bitcoin.ECPair.fromWIF('KxVBiv6JZzkprVZuFvbzGY5URKEoWDhG2yRoRknoiKXJUebmnNkh')
      const inputTxId = 'aa94ab02c182214f090e99a0d57021caffd0f195a81c24602b1028b130b63e31'
      const txb = new bitcoin.TransactionBuilder()

      txb.addInput(inputTxId, 0)
      txb.addOutput(signingAddress, amount)
      txb.addOutput(recoveryAddress, amount)
      txb.sign(0, inputKeyPair)

      const tx = txb.build()
      const txId = tx.getId()
      const ddo = decodeDDO(tx)
      const referenceDDO = {
        '@context': 'https://spidchain.com/did/v1',
        id: `did:btcr:${txId}`,
        owner: [{
          id: `did:btcr:${txId}#1`,
          type: ['CryptographicKey', 'EdDsaPublicKey'],
          curve: 'secp256k1',
          address: signingAddress
        }],
        control: [{
          type: 'OrControl',
          signer: [`did:btcr:${txId}`]
        }]
      }

      assert.deepEqual(ddo, referenceDDO)
    })
  })
}

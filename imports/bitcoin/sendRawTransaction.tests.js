/* global describe, it */

import coinSelect from 'coinselect'
import {Meteor} from 'meteor/meteor'
import sb from 'satoshi-bitcoin'

import '/imports/methods/bitcoin'
import sendRawTransaction from './sendRawTransaction'

global.Buffer = global.Buffer || require('buffer').Buffer
const bitcoin = require('bitcoinjs-lib')

if (Meteor.isClient) {
  describe('sendRawTransaction (node running)', function () {
    it('should connect to the remote node', async function () {
      await Meteor.callPromise('bitcoin', 'getInfo')
    })
  })

  describe('sendRawTransaction', function () {
    it('should send a raw transaction', async function () {
      const utxos = await Meteor.callPromise('bitcoin', 'listUnspent')
      const utxos1 = utxos.map(({address, amount, scriptPubKey, txid, vout}) => ({
        address,  // necessary to recover private key later
        scriptPubKey: Buffer.from(scriptPubKey, 'hex'),
        txid,
        value: sb.toSatoshi(amount),
        vout
      }))
      const feeRate = 55
      const targets = [
        {
          address: 'mny3VE8H8BSq2jACeum6yMov4RN1LhFQdX',
          value: 5000
        }
      ]
      const {inputs, outputs} = coinSelect(utxos1, targets, feeRate)
      if (!inputs || !outputs) {
        throw new Error('There were no inputs or outputs returned')
      }
      const network = bitcoin.networks.testnet
      const tx = new bitcoin.TransactionBuilder(network)
      inputs.forEach((input) => tx.addInput(input.txid, input.vout, undefined, input.scriptPubKey))
      const outputs1 = await Promise.all(outputs.map(async ({address, value}) => {
        // watch out, outputs may have been added that you need to provide
        // an output address/script for
        if (!address) {
          address = await Meteor.callPromise('bitcoin', 'getNewAddress')
        }

        return {address, value}
      }))
      outputs1.forEach(({address, value}) => tx.addOutput(address, value))

      const keyPairs = await Promise.all(inputs.map(async ({address}) => {
        const priv = await Meteor.callPromise('bitcoin', 'dumpPrivKey', address)
        return bitcoin.ECPair.fromWIF(priv, network)
      }))

      inputs.forEach((o, i) => tx.sign(i, keyPairs[i]))
      const serialized = tx.build().toHex()
      const txId = await sendRawTransaction(serialized)
      return txId
    })
  })
}

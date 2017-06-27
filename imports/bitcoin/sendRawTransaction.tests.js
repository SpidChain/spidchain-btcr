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
    it('should connect to the remote node', function (done) {
      Meteor.call('bitcoin', 'getInfo', (err, res) => {
        if (err) {
          done(err)
          return
        }
        done()
      })
    })
  })

  describe('sendRawTransaction', function () {
    it('should send a raw transaction', async function (done) {
      const utxos = await Meteor.callPromise('bitcoin', 'listUnspent')
      utxos.forEach((u) => {
        u.value = sb.toSatoshi(u.amount)
      })
//      const utxos1 = utxos.map(({amount, txid, vout}) => ({
//        txId: txid,
//        value: amount * 100000000,
//        vout: vout
//      }))
      const feeRate = 55
      const targets = [
        {
          address: '1EHNa6Q4Jz2uvNExL497mE43ikXhwF6kZm',
          value: 5000
        }
      ]
      console.log('utxos:', utxos)
      console.log('coin', coinSelect(utxos, targets, feeRate));
      const {inputs, outputs} = coinSelect(utxos, targets, feeRate)
      console.log('inputs:', inputs);
      console.log('outputs:', outputs);
      if (!inputs || !outputs) {
        done(new Error('There were no inputs or outputs returned'))
      }
      const network = bitcoin.networks.regtest
      const tx = new bitcoin.TransactionBuilder(network)
      inputs.forEach((input) => tx.addInput(input.txid, input.vout))
      outputs.forEach(async (output) => {
        // watch out, outputs may have been added that you need to provide
        // an output address/script for
        if (!output.address) {
          const changeAddr = await Meteor.callPromise('bitcoin', 'getNewAddress')
          output.address = changeAddr
        }

        tx.addOutput(output.address, output.value)
      })
      inputs.forEach(async (input, i) => {
        const priv = await Meteor.callPromise('bitcoin', 'dumpPrivKey', input.address)
        tx.sign(i, priv)
      })

      const txId = await sendRawTransaction(tx)
      if (txId) {
        done()
      } else {
        done(new Error('sendRawTransaction failed'))
      }
    })
  })
}

/* global describe, it */

import {assert} from 'chai'
import {Meteor} from 'meteor/meteor'
import '/imports/methods/blockchaininfo'

const satoshiAddress = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'

if (Meteor.isClient) {
  describe('listUtxos', function () {
    it('Called with satoshi address returns the corresponding transactions', async function (done) {
      try {
        const utxos = await Meteor.callPromise('blockchaininfo.listUtxos', satoshiAddress)
        assert.equal(utxos[0].tx_hash,
          '3ba3edfd7a7b12b27ac72c3e67768f617fc81bc3888a51323a9fb8aa4b1e5e4a')
        done()
      } catch (e) {
        done(e)
      }
    })
  })
}

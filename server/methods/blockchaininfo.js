import {HTTP} from 'meteor/http'
import {Meteor} from 'meteor/meteor'

Meteor.methods({
  'blockchaininfo.listUtxos': (addr) => {
    if (Meteor.isServer) {
      const url = 'https://blockchain.info/unspent'
      try {
        const res = HTTP.get(url, {params: {active: addr}})
        if (res && res.data && res.data.unspent_outputs) {
          return res.data.unspent_outputs
        }
        throw new Meteor.Error('blockchaininfo.listUtxos', 'No data in the result')
      } catch (err) {
        throw new Meteor.Error('blockchainfo.listUtxos', err)
      }
    }
  }
})

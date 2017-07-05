import {HTTP} from 'meteor/http'
import {Meteor} from 'meteor/meteor'

const blockexplorer = Meteor.settings.public.network === 'testnet'
  ? 'https://testnet.blockexplorer.com'
  : 'https://blockexplorer.com'

Meteor.methods({
  'blockexplorer.utxo': (addr) => {
    if (Meteor.isServer) {
      const url = `${blockexplorer}/api/addr/${addr}/utxo`
      try {
        const res = HTTP.get(url)
        if (res && res.data) {
          return res.data.map(({amount, txid, vout}) => ({amount, txid, vout}))
        }
        throw new Meteor.Error('blockexplorer.utxo', 'No data in the result')
      } catch (err) {
        throw new Meteor.Error('blockexplorer.utxo', err)
      }
    }
  }
})

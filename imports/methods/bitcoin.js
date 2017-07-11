import Client from 'bitcoin-core'
import {Meteor} from 'meteor/meteor'

const client = new Client({
  host: Meteor.settings.public.bitcoinHost,
  password: 'bar',
  network: Meteor.settings.public.network,
  username: 'foo'
})

Meteor.methods({
  async bitcoin (method, ...args) {
    if (Meteor.isServer) {
      try {
        return await client[method](...args)
      } catch (e) {
        throw new Meteor.Error('Bitcoin', e)
      }
    }
  }
})

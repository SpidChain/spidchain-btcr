import {Meteor} from 'meteor/meteor'
import Messaging from '/imports/collections/Messaging'

Meteor.methods({
  'messaging.sendChallenge': ({senderDid, receiverDid, nonce}) => {
    Messaging.insert({senderDid, receiverDid, nonce})
  }
})

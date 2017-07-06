import {Meteor} from 'meteor/meteor'
import Messaging from '/imports/collections/Messaging'

Meteor.methods({
  'messaging.sendChallenge': ({senderDid, receiverDid, nonce}) => {
    Messaging.insert({senderDid, receiverDid, nonce})
  },

  'messaging.sendChallengeResponse': ({senderDid, receiverDid, nonce, signature}) => {
    Messaging.update({senderDid, receiverDid, nonce}, {$set: {signature}}, {multi: true})
  }
})

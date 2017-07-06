import { Meteor } from 'meteor/meteor'
import Messaging from '/imports/collections/Messaging'

Meteor.publish('messaging.contactRequests', (receiverDid) => {
  const requests = Messaging.find({receiverDid})
  return requests
})

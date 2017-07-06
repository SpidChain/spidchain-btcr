import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import ContactRequests from '/imports/ui/ContactRequests'
import Messaging from '/imports/collections/Messaging'

const ContactRequestContainer = createContainer(({did}) => {
  const handle = Meteor.subscribe('messaging.contactRequests', did)
  const loading = !handle.ready()
  const requests = Messaging.find({receiverDid: did, signature: {$exists: false}})
  return {
    loading,
    requests: requests.fetch()
  }
}, ContactRequests)

export default ContactRequestContainer

import { createContainer } from 'meteor/react-meteor-data'
import ContactRequests from 'ui/ContactRequests'
import Messaging from 'collections/Messaging'

// TODO: update to apollo
const ContactRequestContainer = createContainer(({did}) => {
  /*
  const handle = Meteor.subscribe('messaging.contactRequests', did)
  const loading = !handle.ready()
  const requests = Messaging.find({receiverDid: did, signature: {$exists: false}})
  return {
    loading,
    requests: requests.fetch()
  }
  */
}, ContactRequests)

export default ContactRequestContainer

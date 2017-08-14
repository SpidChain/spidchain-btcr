const mongodb = require('mongodb')
const {MongoClient, ObjectId} = mongodb

const messagingTypeDefs = `
type Message {
  _id: String
  senderDid: String
  receiverDid: String
  nonce: Int
  signature: String
}

extend type Query {
  challengeVerify(senderDid: String, receiverDid: String, nonce: Int): Message
  contactRequests(receiverDid: String): [Message]
}

extend type Mutation {
  sendChallenge(senderDid: String, receiverDid: String, nonce: Int): Message
  sendChallengeResponse(senderDid: String, receiverDid: String, nonce: Int, signature: String): Message
}
`

const prepare = (o) => {
  o._id = o._id.toString()
  return o
}

const makeMessagingResolvers = async () => {
  const db = await MongoClient.connect(process.env.MONGO_URL)
  console.log('Connected correctly to server.')

  const Messaging = db.collection('messaging')
  const messagingResolvers = {
    Query: {
      challengeVerify: async (root, {senderDid, receiverDid, nonce}) => {
        return Messaging.findOne({senderDid, receiverDid, nonce})
      },
      contactRequests: async (root, {receiverDid}) => {
        const a = await Messaging.find({receiverDid}).toArray()
        console.log(a)
        return a
      }
    },

    Mutation: {
      sendChallenge: async (root, {senderDid, receiverDid, nonce}) => {
        const res = await Messaging.insert({senderDid, receiverDid, nonce})
        return prepare(await Messaging.findOne({_id: res.insertedIds[0]}))
      },
      sendChallengeResponse: async (root, {senderDid, receiverDid, nonce, signature}) => {
        const res = Messaging.update({senderDid, receiverDid, nonce, signature},
          {$set: {signature}}, {multi: true})
        return prepare(await Messaging.findOne({_id: res.insertedIds[0]}))
      }
    }
  }
  return messagingResolvers
}

module.exports = {
  makeMessagingResolvers,
  messagingTypeDefs
}

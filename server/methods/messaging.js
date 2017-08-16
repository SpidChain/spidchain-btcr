const mongodb = require('mongodb')
const {MongoClient, ObjectId} = mongodb

const messagingTypeDefs = `
type Message {
  _id: String
  senderDid: String
  receiverDid: String
  nonce: Int
  signature: String
  type: String
  received: Boolean
}

extend type Query {
  getOwnershipProofs(senderDid: String, receiverDid: String, nonce: Int, type: String): [Message]
  getOwnershipRequests(receiverDid: String, type: String): [Message]
}

extend type Mutation {
  sendOwnershipRequest(senderDid: String, receiverDid: String, nonce: Int): Message
  sendOwnershipProof(senderDid: String, receiverDid: String, nonce: Int, signature: String): Message
  setReceived(_id: String): Message
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
      getOwnershipProofs: async (root, {senderDid}) => {
        const data = await Messaging.find(
          {senderDid, type: 'OWNERSHIP_PROOF', received: false},
          {receiverDid: 1, signature: 1}).toArray()
        return data
      },
      getOwnershipRequests: async (root, {receiverDid}) => {
        const data = await Messaging.find(
          {receiverDid, type: 'OWNERSHIP_REQUEST', received: false},
          {senderDid: 1, nonce: 1}).toArray()
        return data
      }
    },

    Mutation: {
      sendOwnershipRequest: async (root, {senderDid, receiverDid, nonce}) => {
        const {ops} = await Messaging.insert(
        {senderDid, receiverDid, nonce, type: 'OWNERSHIP_REQUEST', received: false})
        return prepare(ops[0])
      },
      sendOwnershipProof: async (root, {senderDid, receiverDid, signature}) => {
        const {ops} = await Messaging.insert(
        {senderDid, receiverDid, signature, type: 'OWNERSHIP_PROOF', received: false})
        return prepare(ops[0])
      },
      setReceived: async (root, {_id}) => {
        console.log('id si', _id)
        await Messaging.update({_id: new ObjectId(_id)}, {$set: {received: true}})
        return prepare(await Messaging.findOne({_id: new ObjectId(_id)}, {received: 1}))
      }
    }
  }
  return messagingResolvers
}

module.exports = {
  makeMessagingResolvers,
  messagingTypeDefs
}

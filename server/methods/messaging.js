const mongodb = require('mongodb')
const {MongoClient, ObjectId} = mongodb

const messagingTypeDefs = `
type Message {
  _id: String
  senderDid: String
  receiverDid: String
  claim: String
  claimId: String
  claimSignature: String
  nonce: String
  signature: String
  type: String
  received: Boolean
  subjects: [String]
  claimType: String
}

extend type Query {
  getOwnershipProofs(senderDid: String, receiverDid: String, nonce: String, type: String): [Message]
  getOwnershipRequests(receiverDid: String): [Message]
  getClaimSignatureRequests(receiverDid: String, type: String): [Message]
  getClaimSignatures(receiverDid: String, type: String): [Message]
  getClaims(receiverDid: String): [Message]
}

extend type Mutation {
  sendOwnershipRequest(senderDid: String, receiverDid: String, claim: String, nonce: String): Message
  sendOwnershipProof(senderDid: String, receiverDid: String, nonce: Int, signature: String): Message
  setReceived(_id: String): Message
  sendClaimSignatureRequest(senderDid: String, receiverDid: String, claimId: String, claim: String): Message
  sendClaimSignature(senderDid: String, receiverDid: String, claimId: String, claimSignature: String): Message
  sendClaim(senderDid: String, receiverDid: String, claim: String, claimType: String, subjects: [String]): Message
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
          {senderDid: 1, claim: 1, nonce: 1}).toArray()
        return data
      },
      getClaimSignatureRequests: async (root, {receiverDid}) => {
        const data = await Messaging.find(
          {receiverDid, type: 'CLAIM_SIGNATURE_REQUEST', received: false},
          {senderDid: 1, claimId: 1, claim: 1}).toArray()
        return data
      },
      getClaimSignatures: async (root, {receiverDid}) => {
        const data = await Messaging.find(
          {receiverDid, type: 'CLAIM_SIGNATURE', received: false},
          {senderDid: 1, claimId: 1, claimSignature: 1}).toArray()
        return data
      },
      getClaims: async (root, {receiverDid}) => {
        const data = await Messaging.find(
          {receiverDid, type: 'CLAIM', received: false},
          {senderDid: 1, claim: 1, claimType: 1, subjects: 1}).toArray()
        return data
      }
    },

    Mutation: {
      sendOwnershipRequest: async (root, {senderDid, receiverDid, claim, nonce}) => {
        const {ops} = await Messaging.insert(
        {senderDid, receiverDid, claim, nonce, type: 'OWNERSHIP_REQUEST', received: false})
        return prepare(ops[0])
      },
      sendOwnershipProof: async (root, {senderDid, receiverDid, signature}) => {
        const {ops} = await Messaging.insert(
        {senderDid, receiverDid, signature, type: 'OWNERSHIP_PROOF', received: false})
        return prepare(ops[0])
      },
      setReceived: async (root, {_id}) => {
        await Messaging.update({_id: new ObjectId(_id)}, {$set: {received: true}})
        return prepare(await Messaging.findOne({_id: new ObjectId(_id)}, {received: 1}))
      },
      sendClaimSignatureRequest: async (root, {senderDid, receiverDid, claimId, claim}) => {
        const {ops} = await Messaging.insert(
        {senderDid, receiverDid, claimId, claim, type: 'CLAIM_SIGNATURE_REQUEST', received: false})
        return prepare(ops[0])
      },
      sendClaimSignature: async (root, {senderDid, receiverDid, claimId, claimSignature}) => {
        const {ops} = await Messaging.insert({
          senderDid,
          receiverDid,
          claimId,
          claimSignature,
          type: 'CLAIM_SIGNATURE',
          received: false
        })
        return prepare(ops[0])
      },
      sendClaim: async (root, {senderDid, receiverDid, claim, claimType, subjects}) => {
        const {ops} = await Messaging.insert({
          senderDid,
          receiverDid,
          claim,
          claimType,
          subjects,
          type: 'CLAIM',
          received: false
        })
        return prepare(ops[0])
      }
    }
  }
  return messagingResolvers
}

module.exports = {
  makeMessagingResolvers,
  messagingTypeDefs
}

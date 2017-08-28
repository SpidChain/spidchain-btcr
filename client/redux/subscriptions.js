import client from 'apollo'
import _ from 'lodash'
import gql from 'graphql-tag'

import {
  addClaimSignatureRequest,
  addReceivedRequest,
  checkOwnershipProof,
  addClaimSignature
} from 'redux/actions'

// Listening on ownership proof requests

const getOwnershipRequests = gql`
  query getOwnershipRequests($receiverDid: String) {
     getOwnershipRequests(receiverDid: $receiverDid) {
       _id
       senderDid
       nonce
    }
  }
`

const setReceived = gql`
  mutation setReceived($_id: String) {
     setReceived(_id: $_id) {
       received
    }
  }
`
const ownershipRequestsObs = (did) => client.watchQuery({
  query: getOwnershipRequests,
  pollInterval: 10000,
  variables: {receiverDid: did}
})

export const ownershipRequestsSub = (did, dispatch) => ownershipRequestsObs(did).subscribe({
  next: ({data: {getOwnershipRequests}}) => {
    _.each(getOwnershipRequests, async ({_id, senderDid, nonce}) => {
      // TODO: fix this?
      await dispatch(addReceivedRequest({_id, senderDid, nonce}))
      await client.mutate({
        mutation: setReceived,
        variables: {_id}
      })
    })
  }
})

// Listening on new ownership proofs messages

const getOwnershipProofs = gql`
  query getOwnershipProofs($senderDid: String) {
     getOwnershipProofs(senderDid: $senderDid) {
       _id
       receiverDid
       signature
    }
  }
`
const ownershipProofsObs = (did) => client.watchQuery({
  query: getOwnershipProofs,
  pollInterval: 10000,
  variables: {senderDid: did}
})

export const ownershipProofsSub = (did, dispatch) => ownershipProofsObs(did).subscribe({
  next: ({data: {getOwnershipProofs}}) => {
    _.each(getOwnershipProofs, async ({_id, receiverDid, signature}) => {
      await dispatch(checkOwnershipProof({_id, receiverDid, signature}))
      await client.mutate({
        mutation: setReceived,
        variables: {_id}
      })
    })
  }
})

// Listening on new claim signature requests

const getClaimSignatureRequests = gql`
  query getClaimSignatureRequests($receiverDid: String) {
     getClaimSignatureRequests(receiverDid: $receiverDid) {
       _id
       senderDid
       claimId
       claim
    }
  }
`

const claimSignatureRequestsObs = (did) => client.watchQuery({
  query: getClaimSignatureRequests,
  pollInterval: 10000,
  variables: {receiverDid: did}
})

export const claimSignatureRequestsSub = (did, dispatch) => claimSignatureRequestsObs(did).subscribe({
  next: ({data: {getClaimSignatureRequests}}) => {
    _.each(getClaimSignatureRequests, async ({_id, senderDid, claimId, claim}) => {
      await dispatch(addClaimSignatureRequest({senderDid, claimId, claim}))
      await client.mutate({
        mutation: setReceived,
        variables: {_id}
      })
    })
  }
})

const getClaimSignatures = gql`
  query getClaimSignatures($receiverDid: String) {
     getClaimSignatures(receiverDid: $receiverDid) {
       _id
       claimId
       senderDid
       claimSignature
    }
  }
`

const claimSignatureObs = (did) => client.watchQuery({
  query: getClaimSignatures,
  pollInterval: 10000,
  variables: {receiverDid: did}
})

export const claimSignaturesSub = (did, dispatch) => claimSignatureObs(did).subscribe({
  next: ({data: {getClaimSignatures}}) => {
    _.each(getClaimSignatures, async ({_id, senderDid, claimId, claimSignature}) => {
      await dispatch(addClaimSignature({
        senderDid,
        claimId,
        claimSignature: JSON.parse(claimSignature)
      }))
      await client.mutate({
        mutation: setReceived,
        variables: {_id}
      })
    })
  }
})

import client from 'apollo'
import db from 'db'
import _ from 'lodash'
import {gql} from 'react-apollo'

import verifyWithOwnerKey256 from 'bitcoin/verify'
import {getReceivedRequests, getSentRequests} from 'redux/actions'

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

const addReceivedRequest = async (dispatch, {_id, senderDid, nonce}) => {
  const payload = {_id, senderDid, nonce, verified: 'false'}
  try {
    await db.receivedRequests.add(payload)
    dispatch(getReceivedRequests)
  } catch (e) {
    console.error('addReceivedRequest:', e)
  }
}

export const ownershipRequestsSub = (did, dispatch) => ownershipRequestsObs(did).subscribe({
  next: ({data: {getOwnershipRequests}}) => {
    _.each(getOwnershipRequests, async ({_id, senderDid, nonce}) => {
      await addReceivedRequest(dispatch, {_id, senderDid, nonce})
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

const checkOwnershipProof = async (dispatch, {_id, receiverDid, signature}) => {
  try {
    const {_id, nonce} = await db.sentRequests.get({receiverDid})
    const p = await verifyWithOwnerKey256({DID: receiverDid, msg: nonce, sig: signature})
    if (p) {
      await db.sentRequests.update({_id}, {verified: 'true'})
    } else {
      await db.sentRequests.update({_id}, {verified: 'fail'})
    }
    dispatch(getSentRequests)
  } catch (e) {
    console.error('addReceivedRequest:', e)
  }
}

export const ownershipProofsSub = (did, dispatch) => ownershipProofsObs(did).subscribe({
  next: ({data: {getOwnershipProofs}}) => {
    _.each(getOwnershipProofs, async ({_id, receiverDid, signature}) => {
      await checkOwnershipProof(dispatch, {_id, receiverDid, signature})
      await client.mutate({
        mutation: setReceived,
        variables: {_id}
      })
    })
  }
})

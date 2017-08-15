import {createStore, combineReducers, applyMiddleware, compose} from 'redux'
import thunk from 'redux-thunk'
import {gql} from 'react-apollo'
import {
  receivedRequests,
  sentRequests,
  did,
  wallet,
  loading
} from 'redux/reducers'
import {
  getReceivedRequests,
  getSentRequests,
  getDid,
  getWallet
} from 'redux/actions'
import verifyWithOwnerKey256 from 'bitcoin/verify'
import _ from 'lodash'

import client from 'apollo'
import db from 'db'

export const store = createStore(
  combineReducers({
    apollo: client.reducer(),
    receivedRequests,
    sentRequests,
    did,
    wallet,
    loading
  }),
  undefined,
  compose(
    applyMiddleware(thunk),
    applyMiddleware(client.middleware()),
    // If you are using the devToolsExtension, you can add it here also
    (typeof window.__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined')
    ? window.__REDUX_DEVTOOLS_EXTENSION__()
    : f => f)
)

store.dispatch(getReceivedRequests())
store.dispatch(getSentRequests())
store.dispatch(getDid())
store.dispatch(getWallet())

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
const ownershipRequestsObs = client.watchQuery({
  query: getOwnershipRequests,
  pollInterval: 10000,
  // TODO: should be my DID
  variables: {receiverDid: store.getState().did.did}
})

const addReceivedRequest = async ({_id, senderDid, nonce}) => {
  const payload = {_id, senderDid, nonce, verified: 'false'}
  try {
    await db.receivedRequests.add(payload)
    store.dispatch(getReceivedRequests)
  } catch (e) {
    console.error('addReceivedRequest:', e)
  }
}

ownershipRequestsObs.subscribe({
  next: ({data: {getOwnershipRequests}}) => {
    debugger
    _.each(getOwnershipRequests, async ({_id, senderDid, nonce}) => {
      await addReceivedRequest({_id, senderDid, nonce})
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
const ownershipProofsObs = client.watchQuery({
  query: getOwnershipProofs,
  pollInterval: 10000,
  // TODO: should be my DID
  variables: {senderDid: 'txtest1-xznn-xzc8-qqpg-wdlr'}
})

const checkOwnershipProof = async ({_id, receiverDid, signature}) => {
  try {
    const {_id, nonce} = await db.sentRequests.get({receiverDid})
    const p = await verifyWithOwnerKey256({did: receiverDid, msg: nonce, sig: signature, keyIx: 0})
    if(p) {
        await db.sentRequests.update({_id},{verified: 'true'})
    } else {
        await db.sentRequests.update({_id},{verified: 'fail'})
    }
    store.dispatch(getSentRequests)
  } catch (e)  {
    console.error('addReceivedRequest:', e)
  }
}

/*
ownershipProofsObs.subscribe({
  next: ({data: {getOwnershipProofs}}) => {
    console.log(getOwnershipProofs)
    _.each(getOwnershipProofs, async ({_id, receiverDid, nonce}) => {
      await checkOwnershipProof({_id, receiverDid, nonce})
      await client.mutate({
        mutation: setReceived,
        variables: {_id}
      })
    })
  }
})
*/

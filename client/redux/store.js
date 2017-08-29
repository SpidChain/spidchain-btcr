import promiseMiddleware from 'redux-promise-middleware'
import {createStore, combineReducers, applyMiddleware, compose} from 'redux'
import thunk from 'redux-thunk'
import bitcoinRpc from 'bitcoin/bitcoinRpc'
import {getTxInfo} from 'utils/txUtils'
import {txrefEncode} from 'txref-conversion-js'

import watchWallet from 'bitcoin/watchWallet'
import db from 'db'

import {
  receivedRequests,
  sentRequests,
  did,
  wallet,
  othersClaims,
  ownClaims,
  balance
} from 'redux/reducers'

import {
  getReceivedRequests,
  getSentRequests,
  getDid,
  getWallet,
  getOthersClaims,
  getOwnClaims
} from 'redux/actions'

import {
  ownershipRequestsSub,
  ownershipProofsSub,
  claimSignatureRequestsSub,
  claimSignaturesSub
} from 'redux/subscriptions'

import client from 'apollo'

export const store = createStore(
  combineReducers({
    apollo: client.reducer(),
    receivedRequests,
    sentRequests,
    did,
    wallet,
    balance,
    othersClaims,
    ownClaims
  }),
  undefined,
  // {loading: true},
  compose(
    applyMiddleware(thunk),
    applyMiddleware(promiseMiddleware()),
    applyMiddleware(client.middleware()),
    // If you are using the devToolsExtension, you can add it here also
    (typeof window.__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined')
    ? window.__REDUX_DEVTOOLS_EXTENSION__()
    : f => f)
)

store.dispatch(getWallet()).then(({value}) => {
  if (!value) {
    return
  }
  const {wallet: {receivingAddress}} = store.getState()
  watchWallet(store.dispatch)({receivingAddress})
})

store.dispatch(getDid()).then((didObj) => {
  // Only run if there is a did
  if (didObj && didObj.value) {
    // if uncofirmed
    if (didObj.value.unconfirmedDID) {
      watchUnconfirmed({
        txId1: didObj.value.unconfirmedDID
      })
      // if confirmed
    } else {
      initSystem(didObj.value.did)
    }
  }
})

const initSystem = (did) => {
  // const did = didObj.value.did
  ownershipRequestsSub(did, store.dispatch)
  ownershipProofsSub(did, store.dispatch)
  claimSignatureRequestsSub(did, store.dispatch)
  claimSignaturesSub(did, store.dispatch)
  store.dispatch(getReceivedRequests())
  store.dispatch(getSentRequests())
  store.dispatch(getOwnClaims())
  store.dispatch(getOthersClaims())
}

const CONFIRMATIONS = 1

export const watchUnconfirmed = ({txId1}) => {
  const interval = 20000  // 1 minute
  const handle = setInterval(async () => {
    const tx = await bitcoinRpc('getRawTransaction', txId1, 1)
    if (tx.confirmations >= CONFIRMATIONS) {
      const {height, ix} = await getTxInfo(txId1)
      const txRef = txrefEncode(process.env.network, height, ix)
      // TODO: fix
      await db.did.update(txId1, {did: txRef, unconfirmedDID: null})
      store.dispatch(getDid()).then(() => {
        initSystem(txRef)
      })
      clearInterval(handle)
    }
  }, interval)
}

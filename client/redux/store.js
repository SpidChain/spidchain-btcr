import promiseMiddleware from 'redux-promise-middleware'
import {
  createStore,
  combineReducers,
  applyMiddleware,
  compose
} from 'redux'
import thunk from 'redux-thunk'
import {getRawTransaction} from 'bitcoin/bitcoinRpc'
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
  balance,
  gotCoins,
  myKnowsClaims
} from 'redux/reducers'

import {
  getReceivedRequests,
  getSentRequests,
  getDid,
  getWallet,
  getOthersClaims,
  getOwnClaims,
  setGotCoins
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
    ownClaims,
    gotCoins,
    myKnowsClaims
  }),
  {gotCoins: window.localStorage.getItem('gotCoins') === 'true'},
  // {loading: true},
  compose(
    applyMiddleware(thunk),
    applyMiddleware(promiseMiddleware()),
    applyMiddleware(client.middleware()),
    // If you are using the devToolsExtension, you can add it here also
    (typeof window.__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined')
    ? window.__REDUX_DEVTOOLS_EXTENSION__()
    : f => f)
);

// store.dispatch(setGotCoins())

(async () => {
  const [value, didObj] = await Promise.all([
    store.dispatch(getWallet()),
    store.dispatch(getDid())
  ])
  if (!value) {
    return
  }
  const {wallet: {receivingAddress, root}} = store.getState()
  watchWallet(store.dispatch)({receivingAddress})
  if (didObj && didObj.value) {
    // if uncofirmed
    if (didObj.value.unconfirmedDID) {
      watchUnconfirmed({
        txId1: didObj.value.unconfirmedDID
      })
      // if confirmed
    } else {
      initSystem(didObj.value.did, root)
    }
  }
})()
/*
store.dispatch(getWallet()).then(({value}) => {
  if (!value) {
    return
  }
  const {wallet: {receivingAddress, root}} = store.getState()
  watchWallet(store.dispatch)({receivingAddress})
  return root
}).then(root => {
  const didObj = await store.dispatch(getDid())
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
*/
const initSystem = (did, root) => {
  // const did = didObj.value.did
  ownershipRequestsSub(did, store.dispatch, root)
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
  const interval = 60000  // 1 minute
  const handle = setInterval(async () => {
    const tx = await getRawTransaction(txId1)
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

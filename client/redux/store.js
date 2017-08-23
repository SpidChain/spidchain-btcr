import promiseMiddleware from 'redux-promise-middleware'
import {createStore, combineReducers, applyMiddleware, compose} from 'redux'
import thunk from 'redux-thunk'

import db from 'db'
import watchWallet from 'bitcoin/watchWallet'
import {
  receivedRequests,
  sentRequests,
  did,
  wallet,
  loading,
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

import client from 'apollo'

export const store = createStore(
  combineReducers({
    apollo: client.reducer(),
    receivedRequests,
    sentRequests,
    did,
    wallet,
    loading,
    balance,
    othersClaims,
    ownClaims
  }),
 // undefined,
  {loading: true},
  compose(
    applyMiddleware(thunk),
    applyMiddleware(promiseMiddleware()),
    applyMiddleware(client.middleware()),
    // If you are using the devToolsExtension, you can add it here also
    (typeof window.__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined')
    ? window.__REDUX_DEVTOOLS_EXTENSION__()
    : f => f)
)

store.dispatch(getWallet()).then(() => {
  const {wallet: {receivingAddress}} = store.getState()
  console.log(receivingAddress)
  watchWallet(store.dispatch)({receivingAddress})
})

db.did.toArray()
  .then((value) => {
    if (value.length !== 0) {
      const did = value[0].did
      if (did) {
        store.dispatch(getDid())
        store.dispatch(getReceivedRequests())
        store.dispatch(getSentRequests())
        store.dispatch(getOwnClaims(did))
        store.dispatch(getOthersClaims(did))
      }
    }
  })

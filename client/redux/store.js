import {createStore, combineReducers, applyMiddleware, compose} from 'redux'
import thunk from 'redux-thunk'

import db from 'db'
import {
  receivedRequests,
  sentRequests,
  did,
  wallet,
  loading,
  ownClaims
} from 'redux/reducers'
import {
  getReceivedRequests,
  getSentRequests,
  getDid,
  getWallet,
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
    ownClaims
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

db.did.toArray()
  .then((value) => {
    if (value.length !== 0) {
      const did = value[0].did
      if (did) {
        store.dispatch(getReceivedRequests())
        store.dispatch(getSentRequests())
        store.dispatch(getDid())
        store.dispatch(getWallet())
        store.dispatch(getOwnClaims(did))
      }
    }
  })

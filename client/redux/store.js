import {createStore, combineReducers, applyMiddleware, compose} from 'redux'
import thunk from 'redux-thunk'

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

import client from 'apollo'

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

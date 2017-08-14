import {createStore, combineReducers, applyMiddleware, compose} from 'redux'
import thunk from 'redux-thunk'
import {gql} from 'react-apollo'
import {receivedRequests, sentRequests} from 'redux/reducers'
import {getReceivedRequests, getSentRequests} from 'redux/actions'
import _ from 'lodash'

import client from 'apollo'
import db from 'db'

export const store = createStore(
  combineReducers({
    apollo: client.reducer(),
    receivedRequests,
    sentRequests
    // rootReducer
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

const contactRequests = gql`
  query contactRequests($receiverDid: String) {
     contactRequests(receiverDid: $receiverDid) {
       _id
       senderDid
       nonce
    }
  }
`
const obs = client.watchQuery({
  pollInterval: 10000,
  query: contactRequests,
  // TODO: should be my DID
  variables: {receiverDid: 'txtest1-xznn-xzc8-qqpg-wdlr'}
})

const addReceivedRequest = ({_id, senderDid, nonce}) => {
  const payload = {_id, senderDid, nonce, verified: false}
  db.receivedRequests.add(payload)
    .then(() => {
      store.dispatch(getReceivedRequests)
    })
    .catch(e => {
      console.error('addReceivedRequest:', e)
    })
}

obs.subscribe({
  next: ({data: {contactRequests}}) => {
    _.each(contactRequests, async ({_id, senderDid, nonce}) => {
      addReceivedRequest({_id, senderDid, nonce})
    })
  }
})

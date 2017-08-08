import React from 'react'
import ReactDOM from 'react-dom'
import {ApolloClient, createNetworkInterface, ApolloProvider} from 'react-apollo'
import {createStore, combineReducers, applyMiddleware, compose} from 'redux'

import 'styles'
import App from 'ui/App'

const client = new ApolloClient({
  networkInterface: createNetworkInterface({uri: 'http://localhost:3000/graphql'})
})

const store = createStore(
  combineReducers({
    apollo: client.reducer()
  }),
  {}, // initial state
  compose(
    applyMiddleware(client.middleware()),
    // If you are using the devToolsExtension, you can add it here also
    (typeof window.__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined')
    ? window.__REDUX_DEVTOOLS_EXTENSION__()
    : f => f)
)

const render = () => {
  ReactDOM.render(
    <ApolloProvider store={store} client={client}>
      <App />
    </ApolloProvider>
    , document.getElementById('app'))
}
document.addEventListener('DOMContentLoaded', () => render())

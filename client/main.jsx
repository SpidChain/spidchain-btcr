import React from 'react'
import ReactDOM from 'react-dom'
import {ApolloProvider} from 'react-apollo'
import 'styles'
import App from 'ui/App'
import client from 'apollo'
import {store} from 'redux/store'

const render = () => {
  ReactDOM.render(
    <ApolloProvider store={store} client={client}>
      <App />
    </ApolloProvider>
    , document.getElementById('app'))
}
document.addEventListener('DOMContentLoaded', () => render())

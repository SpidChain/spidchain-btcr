import React from 'react'
import ReactDOM from 'react-dom'
import {Provider} from 'react-redux'
import 'styles'
import App from 'ui/App'
import {store} from 'redux/store'

const render = () => {
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>
    , document.getElementById('app'))
}
document.addEventListener('DOMContentLoaded', () => render())

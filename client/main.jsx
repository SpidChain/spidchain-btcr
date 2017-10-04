import React from 'react'
import ReactDOM from 'react-dom'
import {Provider} from 'react-redux'
import 'styles'
import App from 'ui/App'
import {store} from 'redux/store'

window.name = 'spidchain'

const render = () => {
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>
    , document.getElementById('app'))
}
const main = () => {
  console.log('Initializing cordova')
  render()
  // document.addEventListener('DOMContentLoaded', () => { console.log(rendering); render()})
}

if (window.cordova) {
  document.addEventListener('deviceready', main, false)
} else {
  main()
}

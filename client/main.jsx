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

const mainCordova = () => {
  if (window.device &&
    window.device.platform === 'iOS' &&
    parseFloat(window.device.version) >= 7.0) {
    document.body.classList.add('cordova-ios-7')
  }
  render()
  // document.addEventListener('DOMContentLoaded', () => { console.log(rendering); render()})
}

const main = () => render()

if (window.cordova) {
  console.log('Initializing cordova')
  document.addEventListener('deviceready', mainCordova, false)
} else {
  main()
}

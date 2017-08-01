import {Meteor} from 'meteor/meteor'
import React from 'react'
import ReactDOM from 'react-dom'
import {getSpendingTx, followFirstOut, getPath} from '/imports/utils/txUtils'
import App from '/imports/ui/App'
window.getSpendingTx = getSpendingTx
const tx ='ed8d8ca1954ae639b9f9fcd70f0ce9d46ec9cc781454000540b17266af0935f0'
getSpendingTx(tx,0)
  .then(res => {console.log('getSpendingTx: ',res)})
  .catch(err => {console.error(err)})
followFirstOut(tx)
  .then(res => {console.log('followFirstOut: ',res)})
  .catch(err => {console.error(err)})
getPath(tx)
  .then(res => {console.log('getPath: ',res)})
  .catch(err => {console.error(err)})
Meteor.startup(() => {
  ReactDOM.render(<App />, document.getElementById('app'))
})

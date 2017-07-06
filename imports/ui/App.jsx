import createReactClass from 'create-react-class'
import {Meteor} from 'meteor/meteor'
import React from 'react'
import {BrowserRouter, Route} from 'react-router-dom'
import 'react-notifications/dist/react-notifications.css'
import {NotificationContainer} from 'react-notifications'

import ActivationFlow from './ActivationFlow'
import AddContact from './AddContact.jsx'
import Home from './Home'
import NavBar from './NavBar'
import Contacts from '/imports/ui/Contacts'
import ContactRequestsContainer from '/imports/ui/ContactRequestsContainer'

const confirmations = 1

export default createReactClass({
  displayName: 'App',

  getInitialState: () => ({
    did: window.localStorage.getItem('did'),
    unconfirmedDID: window.localStorage.getItem('unconfirmedDID'),
    wallet: window.localStorage.getItem('wallet')
  }),

  componentDidMount () {
    const unconfirmedDID = this.state.unconfirmedDID
    if (unconfirmedDID) {
      this.watchUnconfirmed(unconfirmedDID)
    }
  },

  onWallet (root) {
    window.localStorage.setItem('wallet', root)
    this.setState({
      wallet: root
    })
  },

  watchUnconfirmed (txId) {
    const interval = 60000  // 1 minute
    const handle = setInterval(async () => {
      const tx = await Meteor.callPromise('bitcoin', 'getRawTransaction', txId, 1)
      if (tx.confirmations >= confirmations) {
        this.setState({
          did: txId,
          unconfirmedDID: null
        })
        window.localStorage.removeItem('unconfirmedDID')
        window.localStorage.setItem('did', txId)
        clearInterval(handle)
      }
    }, interval)
  },

  onDID (didTx) {
    const txId = didTx.getId()
    this.setState({
      unconfirmedDID: txId
    })
    window.localStorage.setItem('unconfirmedDID', txId)
    this.watchUnconfirmed(txId)
  },

  render () {
    const {did, unconfirmedDID, wallet} = this.state

    if (did) {
      return (
        <BrowserRouter>
          <div>
            <NavBar />
            <Route exact path='/' render={() => <Home did={did} wallet={wallet} />} />
            <Route exact path='/addContact' render={() => <AddContact did={did} />} />
            <Route exact path='/contactRequests'
              render={() => <ContactRequestsContainer did={did} wallet={wallet} />} />
            <Route exact path='/contacts' render={() => <Contacts did={did} />} />
            <NotificationContainer />
          </div>
        </BrowserRouter>
      )
    }

    return (
      <div>
        <ActivationFlow
          unconfirmedDID={unconfirmedDID}
          wallet={wallet}
          onWallet={this.onWallet}
          onDID={this.onDID}
        />
        <NotificationContainer />
      </div>
    )
  }
})

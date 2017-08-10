import createReactClass from 'create-react-class'
import React from 'react'
import {BrowserRouter, Route} from 'react-router-dom'
import 'react-notifications/dist/react-notifications.css'
import {NotificationContainer} from 'react-notifications'
import {txrefEncode} from 'txref-conversion-js'

import ActivationFlow from 'ui/ActivationFlow'
import AddContact from 'ui/AddContact.jsx'
import Home from 'ui/Home'
import NavBar from 'ui/NavBar'
import Developer from 'ui/Developer'
import Contacts from 'ui/Contacts'
// import ContactRequestsContainer from 'ui/ContactRequestsContainer'
import {getTxInfo} from 'utils/txUtils'
import bitcoinRpc from 'bitcoin/bitcoinRpc'

const confirmations = 1

export default createReactClass({
  displayName: 'App',

  getInitialState: () => ({
    did: window.localStorage.getItem('did'),
    didTxId: window.localStorage.getItem('didTxId'),
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
      // const tx = await bitcoinRpc('bitcoin', 'getRawTransaction', txId, 1)
      const tx = await bitcoinRpc('getRawTransaction', txId, 1)
      if (tx.confirmations >= confirmations) {
        const {height, ix} = await getTxInfo(txId)
        const txRef = txrefEncode(process.env.network, height, ix)
        this.setState({
          did: txRef,
          didTxId: txId,
          unconfirmedDID: null
        })
        window.localStorage.removeItem('unconfirmedDID')
        window.localStorage.setItem('did', txRef)
        window.localStorage.setItem('didTxId', txId)
        clearInterval(handle)
      }
    }, interval)
  },

  setDID: function ({txId1, txId2}) {
    this.setState({
      unconfirmedDID: txId1
    })
    window.localStorage.setItem('unconfirmedDID', txId1)
    this.watchUnconfirmed(txId1)
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
            {/*
            <Route exact path='/contactRequests'
              render={() => <ContactRequestsContainer did={did} wallet={wallet} />} />
              */}
            <Route exact path='/contacts' render={() => <Contacts did={did} />} />
            <Route exact path='/developer' render={() => <Developer did={did} />} />
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
          setDID={this.setDID}
        />
        <NotificationContainer />
      </div>
    )
  }
})
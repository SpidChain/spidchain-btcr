import createReactClass from 'create-react-class'
import React from 'react'
import {connect} from 'react-redux'
import {BrowserRouter, Route} from 'react-router-dom'
import 'react-notifications/dist/react-notifications.css'
import {NotificationContainer} from 'react-notifications'
import Spinner from 'react-spinkit'

import ActivationFlow from 'ui/ActivationFlow'
import AddContact from 'ui/AddContact'
import Home from 'ui/Home'
import NavBar from 'ui/NavBar'
import Developer from 'ui/Developer'
import Contacts from 'ui/Contacts'
import ContactRequests from 'ui/ContactRequests'
import {watchUnconfirmed} from 'ui/CreateDID'
import GenerateClaim from 'ui/GenerateClaim'
import OwnClaims from 'ui/OwnClaims'

const App = createReactClass({
  displayName: 'App',

  /*
  getInitialState: () => ({
    did: window.localStorage.getItem('did'),
    didTxId: window.localStorage.getItem('didTxId'),
    unconfirmedDID: window.localStorage.getItem('unconfirmedDID'),
    wallet: window.localStorage.getItem('wallet')
  }),
  */

  componentDidMount () {
    if (this.props.did && this.props.did.unconfirmedDID) {
      watchUnconfirmed({
        txId1: this.props.did.unconfirmedDID,
        dispatch: this.props.dispatch
      })
    }
  },

  /*
  onWallet (root) {
    window.localStorage.setItem('wallet', root)
    this.setState({
      wallet: root
    })
  },
  */

  render () {
    const {did, wallet, loading} = this.props
    if (loading) {
      return <Spinner name='double-bounce' />
    }
    return wallet && wallet && wallet.root && did && did.did
      ? <BrowserRouter>
        <div>
          <NavBar />
          <Route exact path='/' render={() => <Home />} />
          <Route exact path='/addContact' render={() => <AddContact />} />
          <Route exact path='/contactRequests' render={() => <ContactRequests />} />
          <Route exact path='/contacts' render={() => <Contacts />} />
          <Route exact path='/generateClaim' component={GenerateClaim} />
          <Route exact path='/developer' render={() => <Developer />} />
          <Route exact path='/ownClaims' component={OwnClaims} />
          <NotificationContainer />
        </div>
      </BrowserRouter>
      : <div>
        <ActivationFlow />
        <NotificationContainer />
      </div>
  }
})

export default connect(s => s)(App)

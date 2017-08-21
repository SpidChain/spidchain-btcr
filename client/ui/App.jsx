import createReactClass from 'create-react-class'
import React from 'react'
import {connect} from 'react-redux'
import {BrowserRouter, Route} from 'react-router-dom'
import 'react-notifications/dist/react-notifications.css'
import {NotificationContainer} from 'react-notifications'
import {Col, Container, Row} from 'reactstrap'
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
import OthersClaims from 'ui/OthersClaims'
import OwnClaims from 'ui/OwnClaims'

const centerElement = {
  'height': '100vh',
  'display': 'flex',
  'align-items': 'center',
  'justify-content': 'center'
}

const App = createReactClass({
  displayName: 'App',

  componentDidMount () {
    if (this.props.did && this.props.did.unconfirmedDID) {
      watchUnconfirmed({
        txId1: this.props.did.unconfirmedDID,
        dispatch: this.props.dispatch
      })
    }
  },

  render () {
    const {did, wallet, loading} = this.props
    if (loading) {
      return (
        <Container fluid style={centerElement}>
          <Spinner name='double-bounce' />
        </Container>
      )
    }
    return wallet && wallet && wallet.root && did && did.did
      ? <BrowserRouter>
        <div>
          <NavBar />
          <Route exact path='/' component={Home} />
          <Route exact path='/addContact' component={AddContact} />
          <Route exact path='/contactRequests' component={ContactRequests} />
          <Route exact path='/contacts' component={Contacts} />
          <Route exact path='/generateClaim' component={GenerateClaim} />
          <Route exact path='/developer' component={Developer} />
          <Route exact path='/ownClaims' component={OwnClaims} />
          <Route exact path='/othersClaims' component={OthersClaims} />
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

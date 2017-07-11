import createReactClass from 'create-react-class'
import {Meteor} from 'meteor/meteor'
import React from 'react'
import {Container, Jumbotron, ListGroup} from 'reactstrap'

import Contact from '/imports/ui/Contact'
import verify from '/imports/bitcoin/verify'

const Contacts = createReactClass({
  getInitialState: () => {
    const ls = window.localStorage
    const keys = Object.keys(ls).filter(k => k.length === 64)
    const contacts = keys.map((key) => {
      const contactInfo = JSON.parse(window.localStorage.getItem(key))

      return {did: key, ...contactInfo}
    })

    return {
      contacts
    }
  },

  async updateContact ({senderDid, receiverDid, nonce}) {
    const {signature} = await Meteor.callPromise('messaging.challengeVerify', {
      senderDid,
      receiverDid,
      nonce
    })

    const contact = {
      did: receiverDid,
      nonce
    }

    if (!signature) {
      contact.verified = false
      return contact
    }
    const res = await verify({did: receiverDid, msg: nonce, sig: signature, keyIx: 0})
    contact.verified = res
    window.localStorage.setItem(contact.did, JSON.stringify({
      nonce,
      verified: res
    }))
    return contact
  },

  componentDidMount () {
    Promise.all(this.state.contacts.map(contact => this.updateContact({
      senderDid: this.props.did,
      receiverDid: contact.did,
      nonce: contact.nonce
    })))
      .then(updatedContacts => {
        this.setState({
          contacts: updatedContacts
        })
      })
  },

  render () {
    return (
      <Container fluid>
        <Jumbotron>
          <h1 className='display-3'>My Contacts</h1>
          <p className='lead'>
            This is a list of your DID contacts
          </p>
        </Jumbotron>
        <ListGroup>
          {this.state.contacts.map(({did, verified}) => <Contact key={did} did={did} verified={verified} />)}
        </ListGroup>
      </Container>
    )
  }
})

export default Contacts

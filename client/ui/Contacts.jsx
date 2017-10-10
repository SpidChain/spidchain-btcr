import React from 'react'
import {connect} from 'react-redux'
import {
  Col,
  Container,
  Jumbotron,
  ListGroup,
  Row
} from 'reactstrap'
import Spinner from 'react-spinkit'
import _ from 'lodash'

import Contact from 'ui/Contact'
// import verify from 'bitcoin/verify'

const Contacts = ({did, myKnowsClaims}) =>
  <Container fluid>
    <Row className='mt-3'>
      <Col md='6' className='mx-auto'>
        <Jumbotron>
          <h6 className='mb-0 lead text-center'>
            <strong> Your DID contacts </strong>
          </h6>
        </Jumbotron>
      </Col>
    </Row>
    {!myKnowsClaims || myKnowsClaims.loading
        ? <Spinner name='double-bounce' />
        : <Row className='mt-3'>
          <Col md='6' className='mx-auto'>
            {myKnowsClaims.data.length === 0
                ? <p className='text-center'> No contacts </p>
                : <ListGroup>
                  {myKnowsClaims.data.map(({hash, subjects, signers}) => {
                    const contact = subjects.filter(e => e !== did.did)
                    const verified = _.difference(subjects, signers).length === 0
                    return <Contact key={hash} contact={contact} verified={verified} />
                  })
                  }
                </ListGroup>
            }
          </Col>
        </Row>
    }
  </Container>

  /*
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
        <Row className='mt-3'>
          <Col md='6' className='mx-auto'>
            <Jumbotron>
              <h1 className='lead text-center'>
                <strong> Your DID contacts </strong>
              </h1>
            </Jumbotron>
          </Col>
        </Row>
        <Row className='mt-3'>
          <Col md='6' className='mx-auto'>
            {this.state.contacts.length === 0
                ? <h3> Your addressbook is empty </h3>
                : <ListGroup>
                  {this.state.contacts.map(({did, verified}) => <Contact key={did} did={did} verified={verified} />)}
                </ListGroup>
            }
          </Col>
        </Row>
      </Container>
    )
  }
})
*/

export default connect(s => s)(Contacts)

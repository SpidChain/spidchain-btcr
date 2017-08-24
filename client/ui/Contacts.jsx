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

import Contact from 'ui/Contact'
// import verify from 'bitcoin/verify'

const Contacts = ({sentRequests: {data, loading}}) =>
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
    {loading
        ? <Spinner name='double-bounce' />
        : <Row className='mt-3'>
          <Col md='6' className='mx-auto'>
            {data.length === 0
                ? <h3> There are no contacts </h3>
                : <ListGroup>
                  {data.map(({receiverDid, verified}) =>
                    <Contact
                      key={receiverDid}
                      receiverDid={receiverDid}
                      verified={verified}
                    />)}
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

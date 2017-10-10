import createReactClass from 'create-react-class'
import React from 'react'
import {withRouter} from 'react-router-dom'
import {
  Col,
  Container,
  Jumbotron,
  Row
} from 'reactstrap'
import gql from 'graphql-tag'
import {NotificationManager} from 'react-notifications'
import {getSentRequests} from 'redux/actions'
import {connect} from 'react-redux'

import db from 'db'
import client from 'apollo'

const getSecureRandom = () => {
  // TODO: now using Uint16Array because of problem with indexedDb,
  // replace with Uint32Array
  const array = new Uint16Array(1)
  window.crypto.getRandomValues(array)
  return array[0]
}

const sendOwnershipRequest = gql`
  mutation sendOwnershipRequest($senderDid: String, $receiverDid: String, $nonce: Int) {
    sendOwnershipRequest(senderDid: $senderDid, receiverDid: $receiverDid, nonce: $nonce) {
     _id
  }
}`

const AddContact = createReactClass({
  getInitialState: () => ({
  }),

  componentDidMount () {
    window.QRScanner.show()
    window.QRScanner.scan(this.handleScan)
  },

  componentWillUnmount () {
    window.QRScanner.destroy()
  },

  handleScan: async function (err, data) {
    if (err) {
      switch (err.name) {
        case 'SCAN_CANCELED':
          console.error('The scan was canceled before a valide QR code was found')
          return
        default:
          NotificationManager.error('Scanning failed', '', 5000)
          console.error(err)
          return
      }
    }

    window.QRScanner.pausePreview()
    const receiverDid = data
    const nonce = getSecureRandom()
    try {
      const {data: {sendOwnershipRequest: {_id}}} =
        await client.mutate({mutation: sendOwnershipRequest, variables: {senderDid: this.props.did, receiverDid, nonce}})
      await db.sentRequests.add({_id, receiverDid, nonce, verified: 'false'})
      this.props.dispatch(getSentRequests())
      NotificationManager.success('DID: ' + receiverDid, 'Message sent', 5000)
      this.props.history.push('/')
    } catch (e) {
      NotificationManager.error(e.message, 'Message not sent', 5000)
      console.error(e)
      window.QRScanner.resumePreview()
      window.QRScanner.scan(this.handleScan)
    }
  },

  render () {
    return (
      <Container fluid>
        <Row className='mt-3'>
          <Col md='6' className='mx-auto'>
            <Jumbotron>
              <h6 className='mb-0 lead text-center'>
                <strong> Scan QRcode to send contact request</strong>
              </h6>
            </Jumbotron>
          </Col>
        </Row>
      </Container>
    )
  }
})

export default connect(({did}) => did)(withRouter(AddContact))

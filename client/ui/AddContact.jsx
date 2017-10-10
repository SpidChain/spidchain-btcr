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
import {getClaims, getMyKnowsClaims} from 'redux/actions'
import {connect} from 'react-redux'

import client from 'apollo'
import signClaim from 'bitcoin/signClaim'
import {insertClaim} from 'dbUtils'

const sendOwnershipRequest = gql`
  mutation sendOwnershipRequest(
    $senderDid: String,
    $receiverDid: String,
    $claim: String,
    $nonce: String
  ) {
    sendOwnershipRequest(
      senderDid: $senderDid,
      receiverDid: $receiverDid,
      claim: $claim,
      nonce: $nonce
    ) {
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
    const [receiverDid, nonce] = data.split('/')
    if (!receiverDid || !nonce) {
      return
    }

    const senderDid = this.props.did

    const context = {
      knows: 'http://schema.org/knows'
    }

    const graph1 = {
      '@id': `did:btcr:${senderDid}`,
      knows: `did:btcr:${receiverDid}`
    }

    const graph2 = {
      '@id': `did:btcr:${receiverDid}`,
      knows: `did:btcr:${senderDid}`
    }

    const claim = {
      '@context': context,
      '@graph': [
        graph1,
        graph2
      ]
    }

    const walletRoot = this.props.wallet.root
    const controlAccount = Number(process.env.controlAccount)
    const ownerRoot = walletRoot.derivePath("m/44'/0'")
      .deriveHardened(controlAccount)
      .derive(0)

    const rotationIx = 0

    try {
      const signedClaim = await signClaim({claim, ownerRoot, rotationIx, did: senderDid})
      debugger
      await client.mutate({
        mutation: sendOwnershipRequest,
        variables: {
          senderDid,
          receiverDid,
          claim: JSON.stringify(signedClaim),
          nonce
        }
      })
      debugger
      await insertClaim(
        signedClaim,
        [
          receiverDid,
          senderDid
        ],
        'KNOWS',
        [senderDid]
      )
      this.props.dispatch(getMyKnowsClaims())
      this.props.dispatch(getMyKnowsClaims())
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

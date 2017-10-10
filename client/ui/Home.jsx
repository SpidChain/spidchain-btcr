import createReactClass from 'create-react-class'
import React from 'react'
import {Col, Container, Row} from 'reactstrap'
import {connect} from 'react-redux'
import Icon from 'assets/spidchain-icon'

import db from 'db'
import ShowQRCode from 'ui/ShowQRCode'
import Balance from 'ui/Balance'

const Home = createReactClass({
  getInitialState: () => ({
    nonce: null
  }),

  onShowDID () {
    const a = new Uint32Array(1)
    window.crypto.getRandomValues(a)
    db.nonces.add({nonce: a[0]})
    this.setState({
      nonce: a[0]
    })
  },

  render () {
    const {did, wallet} = this.props

    const didPlusNonce = this.state.nonce
      ? did.did + '/' + this.state.nonce.toString(16)
      : did.did

    return (
      <Container fluid>
        <Row className='mt-3'>
          <Col md='6' className='mx-auto'>
            <Icon className='w-75 d-block mx-auto mt-3' alt='SpidChain icon' />
          </Col>
        </Row>
        <Row className='mt-3'>
          <Col md='6' className='mx-auto'>
            <ShowQRCode content={wallet.receivingAddress}>
              <Balance />
            </ShowQRCode>
          </Col>
        </Row>
        <Row className='mt-3'>
          <Col md='6' className='mx-auto'>
            <ShowQRCode content={didPlusNonce} onModalOpen={this.onShowDID}>
              Show DID
            </ShowQRCode>
          </Col>
        </Row>
      </Container>
    )
  }
})

export default connect(s => s)(Home)

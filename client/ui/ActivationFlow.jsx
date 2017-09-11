import React from 'react'
import {connect} from 'react-redux'
import {Col, Container, Row} from 'reactstrap'

import CreateDID from 'ui/CreateDID'
import GenerateWallet from 'ui/GenerateWallet'
import ShowQRCode from 'ui/ShowQRCode'
import Balance from 'ui/Balance'
import Icon from 'assets/spidchain-icon'

const CONFIRMATIONS = 1

const ActivationFlow = ({did, wallet}) => {
  if (!wallet || !wallet.root) {
    return <GenerateWallet />
  }
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
          {
            //  !did.loading && !did.did
            //  ? (
            <CreateDID />
              // )
              // : <ShowDID />
          }
        </Col>
      </Row>
    </Container>
  )
}

export default connect(s => s)(ActivationFlow)

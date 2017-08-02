import {Meteor} from 'meteor/meteor'
import React from 'react'
import {Col, Container, Row} from 'reactstrap'

import ReceivePayment from './ReceivePayment'
import ShowDID from '/imports/ui/ShowDID'
import ShowDDO from '/imports/ui/ShowDDO'

global.Buffer = global.Buffer || require('buffer').Buffer
const {HDNode, networks} = require('bitcoinjs-lib')

const network = networks[Meteor.settings.public.network]

const Home = ({did, wallet}) => {
  const walletRoot = HDNode.fromBase58(wallet, network)
  const fundingKeyPair = walletRoot.derivePath("m/44'/0'/0'/0/0").keyPair
  const receivingAddress = fundingKeyPair.getAddress()

  return (
    <Container fluid>
      <Row className='mt-3'>
        <Col md='6' className='mx-auto'>
          <img src='/spidchain-logo.png' className='w-75 d-block mx-auto mt-3' alt='SpidChain logo' />
        </Col>
      </Row>
      <Row className='mt-3'>
        <Col md='6' className='mx-auto'>
          <ReceivePayment address={receivingAddress} />
        </Col>
      </Row>
      <Row className='mt-3'>
        <Col md='6' className='mx-auto'>
          <ShowDID did={did} />
        </Col>
      </Row>
    </Container>
  )
}

export default Home

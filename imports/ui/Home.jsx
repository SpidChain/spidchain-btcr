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
  const fundingKeypair = walletRoot.derivePath("m/44'/0'/0'/0/0").keyPair
  const receivingAddress = fundingKeypair.getAddress()

  return (
    <Container fluid>
      <img src='/spidchain-logo.png' className='w-50 d-block mx-auto mt-3' alt='SpidChain logo' />
      <Row className='mt-3'>
        <Col xs='12'>
          <ReceivePayment address={receivingAddress} />
        </Col>
      </Row>
      <Row className='mt-3'>
        <Col xs='12'>
          <ShowDID did={did} />
        </Col>
      </Row>
      <Row className='mt-3'>
        <Col xs='12'>
          <ShowDDO did={did} />
        </Col>
      </Row>
    </Container>
  )
}

export default Home

import {Meteor} from 'meteor/meteor'
import React from 'react'
import {Col, Container, Row} from 'reactstrap'

import CreateIdentity from './CreateIdentity'
import GenerateWallet from './GenerateWallet'
import ReceivePayment from './ReceivePayment'
import ShowDID from './ShowDID'

global.Buffer = global.Buffer || require('buffer').Buffer
const {HDNode, networks} = require('bitcoinjs-lib')

const confirmations = 1
const network = networks[Meteor.settings.public.network]

const ActivationFlow = ({unconfirmedDID, wallet, onWallet, onDID}) => {
  if (!wallet) {
    return <GenerateWallet onWallet={onWallet} />
  }

  const walletRoot = HDNode.fromBase58(wallet, network)
  const fundingKeypair = walletRoot.derivePath("m/44'/0'/0'/0/0").keyPair
  const receivingAddress = fundingKeypair.getAddress()
  const ownerKeyPair = walletRoot.derivePath("m/44'/0'/2'/0/0")
  const ownerPubKey = ownerKeyPair.getPublicKeyBuffer().toString('hex')
  const recoveryKeyPair = walletRoot.derivePath("m/44'/0'/3'/0/0")
  const recoveryAddress = recoveryKeyPair.getAddress()

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
          {
            !unconfirmedDID
              ? (
                <CreateIdentity
                  onDID={onDID}
                  walletRoot={walletRoot}
                  fundingKeypair={fundingKeypair}
                  ownerPubKey={ownerPubKey}
                  recoveryAddress={recoveryAddress}
                />
              )
              : <ShowDID did={unconfirmedDID} />
          }
          {
            unconfirmedDID
              ? (
                <p>Waiting {confirmations} confirmations</p>
              )
              : null
          }
        </Col>
      </Row>
    </Container>
  )
}

export default ActivationFlow

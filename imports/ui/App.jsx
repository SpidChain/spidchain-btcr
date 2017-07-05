import createReactClass from 'create-react-class'
import {Meteor} from 'meteor/meteor'
import React from 'react'
import {Col, Container, Row} from 'reactstrap'

import CreateIdentity from './CreateIdentity'
import GenerateWallet from './GenerateWallet'
import ReceivePayment from '/imports/ui/ReceivePayment'
import ShowDID from './ShowDID'

global.Buffer = global.Buffer || require('buffer').Buffer
const bitcoin = require('bitcoinjs-lib')

const confirmations = 1
const network = bitcoin.networks[Meteor.settings.public.network]

export default createReactClass({
  displayName: 'App',

  getInitialState: () => ({
    did: window.localStorage.getItem('did'),
    unconfirmedDID: window.localStorage.getItem('unconfirmedDID'),
    wallet: window.localStorage.getItem('wallet')
  }),

  componentDidMount () {
    const unconfirmedDID = this.state.unconfirmedDID
    if (unconfirmedDID) {
      this.watchUnconfirmed(unconfirmedDID)
    }
  },

  onWallet (root) {
    window.localStorage.setItem('wallet', root)
    this.setState({
      wallet: root
    })
  },

  watchUnconfirmed (txId) {
    const interval = 60000  // 1 minute
    const handle = setInterval(async () => {
      const tx = await Meteor.callPromise('bitcoin', 'getRawTransaction', txId, 1)
      if (tx.confirmations >= confirmations) {
        this.setState({
          did: txId,
          unconfirmedDID: null
        })
        window.localStorage.removeItem('unconfirmedDID')
        window.localStorage.setItem('did', txId)
        clearInterval(handle)
      }
    }, interval)
  },

  onDID (didTx) {
    const txId = didTx.getId()
    this.setState({
      unconfirmedDID: txId
    })
    window.localStorage.setItem('unconfirmedDID', txId)
    this.watchUnconfirmed(txId)
  },

  render () {
    const {did, unconfirmedDID, wallet} = this.state

    if (wallet) {
      const walletRoot = bitcoin.HDNode.fromBase58(wallet, network)
      const fundingKeypair = walletRoot.derivePath("m/44'/0'/0'/0/0").keyPair
      const receivingAddress = fundingKeypair.getAddress()
      const ownerKeyPair = walletRoot.derivePath("m/44'/0'/2'/0/0")
      const ownerPubKey = ownerKeyPair.getPublicKeyBuffer().toString('hex')
      const recoveryKeyPair = walletRoot.derivePath("m/44'/0'/3'/0/0")
      const recoveryAddress = recoveryKeyPair.getAddress()

      return (
        <Container fluid>
          <img src='/icona_logo.png' className='w-50 d-block mx-auto mt-3' alt='SpidChain logo' />
          <Row className='mt-3'>
            <Col xs='12'>
              <ReceivePayment address={receivingAddress} />
            </Col>
          </Row>
          <Row className='mt-3'>
            <Col xs='12'>
              {
                !did && !unconfirmedDID
                ? (
                  <CreateIdentity
                    onDID={this.onDID}
                    walletRoot={walletRoot}
                    fundingKeypair={fundingKeypair}
                    ownerPubKey={ownerPubKey}
                    recoveryAddress={recoveryAddress}
                    />
                )
                : <ShowDID did={did || unconfirmedDID} />
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

    return <GenerateWallet onWallet={this.onWallet} />
  }
})

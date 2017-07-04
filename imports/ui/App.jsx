import createReactClass from 'create-react-class'
import React from 'react'

import GenerateWallet from './GenerateWallet'
import ReceivePayment from '/imports/ui/ReceivePayment'

global.Buffer = global.Buffer || require('buffer').Buffer
const bitcoin = require('bitcoinjs-lib')

export default createReactClass({
  displayName: 'App',

  getInitialState: () => ({
    wallet: window.localStorage.getItem('wallet')
  }),

  onWallet (root) {
    window.localStorage.setItem('wallet', root)
    this.setState({
      wallet: root
    })
  },

  render () {
    const wallet = this.state.wallet
    const walletRoot = bitcoin.HDNode.fromBase58(wallet)
    const receivingAddress = walletRoot.derivePath("m/44'/0'/0'/0/0").getAddress()
    return wallet
      ? (
        <ReceivePayment address={receivingAddress} />
      )
      : (
        <GenerateWallet onWallet={this.onWallet} />
      )
  }
})

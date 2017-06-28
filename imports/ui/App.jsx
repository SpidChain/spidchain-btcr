import createReactClass from 'create-react-class'
import React from 'react'

import GenerateWallet from './GenerateWallet'

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

    return wallet
      ? (
        <p>
          Hello {wallet}
        </p>
      )
      : (
        <GenerateWallet onWallet={this.onWallet} />
      )
  }
})

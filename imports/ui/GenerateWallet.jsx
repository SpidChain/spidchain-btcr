import React from 'react'
import createReactClass from 'create-react-class'
import {Button, Col, Row} from 'reactstrap'

import createHDWallet from '/imports/bitcoin/createHDWallet'
import InputMnemonic from './InputMnemonic'
import ShowMnemonic from './ShowMnemonic'

global.Buffer = global.Buffer || require('buffer').Buffer
const bip39 = require('bip39')

export default createReactClass({
  displayName: 'GenerateWallet',

  getInitialState: () => ({
    mismatch: false,
    mnemonic: '',
    step: 'start'
  }),

  generateWallet () {
    this.setState({
      mnemonic: bip39.generateMnemonic(),
      step: 'generate'
    })
  },

  checkWords (words) {
    if (this.state.mnemonic === words.join(' ')) {
      this.setState({mismatch: true})
      return
    }

    this.setState({mismatch: false})
    this.setState.step = 'done'
    this.props.onWallet(createHDWallet(this.state.mnemonic))
  },

  render () {
    const state = this.state

    switch (state.step) {
      case 'start':
        return (
          <Button color='primary' onClick={this.generateWallet}>
            Generate Bitcoin wallet
          </Button>
        )
      case 'generate':
        return (
          <div>
            <Row>
              <Col xs='12'>
                <p>
                  Back up the 12 words below in a safe place, then click <code>Next</code>.
                </p>
              </Col>
            </Row>
            <ShowMnemonic words={state.mnemonic.split(' ')} />
            <Button color='primary' onClick={() => this.setState({step: 'confirm'})}>
              Next
            </Button>
          </div>
        )
      case 'confirm':
        return (
          <div>
            <InputMnemonic onBack={this.generateWallet} onWords={this.checkWords} />
            {this.state.mismatch ? <p>Words mismatch</p> : null}
          </div>
        )
      case 'done':
        return <p>Done!</p>
      default:
    }
  }
})

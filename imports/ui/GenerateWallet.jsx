import React from 'react'
import createReactClass from 'create-react-class'
import {Button, Col, Container, Jumbotron, Row} from 'reactstrap'
import {NotificationManager} from 'react-notifications'

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
    if (this.state.mnemonic !== words.join(' ')) {
      this.setState({mismatch: true})
      NotificationManager.error('Words do not match', 'Error!', 5000)
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
          <Container fluid>
            <Row className='mt-3'>
              <Col xs='12'>
                <img src='/icona_logo.png' className='w-50 d-block mx-auto mt-3' alt='SpidChain logo' />
              </Col>
            </Row>
            <Row className='mt-3'>
              <Col xs='12'>
                <Button color='primary' block onClick={this.generateWallet}>
                  Generate Bitcoin wallet
                </Button>
              </Col>
            </Row>
          </Container>
        )
      case 'generate':
        return (
          <Container fluid>
            <Row className='mt-3'>
              <Col xs='12'>
                <Jumbotron>
                  <h1 className='display-3'> Wallet mnemonic </h1>
                  <p className='lead'>
                    Back up the 12 words below in a safe place, you will need to
                    confirm them in the next screen
                  </p>
                </Jumbotron>
              </Col>
            </Row>
            <Row>
              <Col xs='12'>
                <ShowMnemonic words={state.mnemonic.split(' ')} />
              </Col>
            </Row>
            <Row>
              <Col xs='12'>
                <Button color='primary' block onClick={() => this.setState({step: 'confirm'})}>
                  Next
                </Button>
              </Col>
            </Row>
          </Container>
        )
      case 'confirm':
        return (
          <Container fluid>
            <Row className='mt-3'>
              <Col xs='12'>
                <Jumbotron>
                  <h1 className='display-3'> Mnemonic confirmation</h1>
                  <p className='lead'>
                    Please confirm the words from the previous screen
                  </p>
                </Jumbotron>
              </Col>
            </Row>
            <Row>
              <Col xs='12'>
                <InputMnemonic onBack={this.generateWallet} onWords={this.checkWords} />
              </Col>
            </Row>
          </Container>
        )
      case 'done':
        return <p>Done!</p>
      default:
    }
  }
})

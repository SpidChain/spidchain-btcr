import React from 'react'
import createReactClass from 'create-react-class'
import {Button, Col, Container, Jumbotron, Row} from 'reactstrap'
import {NotificationManager} from 'react-notifications'

import createHDWallet from 'bitcoin/createHDWallet'
import InputMnemonic from 'ui/InputMnemonic'
import ShowMnemonic from 'ui/ShowMnemonic'

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
              <Col md='6' className='mx-auto'>
                <img src='/spidchain-logo.png' className='w-50 d-block mx-auto mt-3' alt='SpidChain logo' />
              </Col>
            </Row>
            <Row className='mt-3'>
              <Col md='6' className='mx-auto'>
                <Button color='primary' block onClick={this.generateWallet}>
                  Generate Bitcoin Wallet
                </Button>
              </Col>
            </Row>
          </Container>
        )
      case 'generate':
        return (
          <Container fluid>
            <Row className='mt-3'>
              <Col md='6' className='mx-auto'>
                <Jumbotron>
                  <p className='lead text-center'>
                    <strong> Write down these 12 words below in a safe place </strong>
                  </p>
                  <p className='lead text-center'>
                    <strong> You will need to confirm them in the next screen </strong>
                  </p>
                </Jumbotron>
              </Col>
            </Row>
            <Row className='mt-3'>
              <Col md='6' className='mx-auto'>
                <ShowMnemonic words={state.mnemonic.split(' ')} />
              </Col>
            </Row>
            <Row className='mt-3'>
              <Col md='6' className='mx-auto'>
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
              <Col md='6' className='mx-auto'>
                <Jumbotron>
                  <p className='lead text-center'>
                    <strong> Confirm the words from the previous screen </strong>
                  </p>
                </Jumbotron>
              </Col>
            </Row>
            <Row>
              <Col md='6' className='mx-auto'>
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

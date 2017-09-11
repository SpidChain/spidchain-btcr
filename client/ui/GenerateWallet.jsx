import React from 'react'
import {connect} from 'react-redux'
import createReactClass from 'create-react-class'
import {
  Button,
  Col,
  Container,
  Jumbotron,
  Row
} from 'reactstrap'
import {NotificationManager} from 'react-notifications'
import bip39 from 'bip39'
import {HDNode, networks} from 'bitcoinjs-lib'

import createHDWallet from 'bitcoin/createHDWallet'
import InputMnemonic from 'ui/InputMnemonic'
import ShowMnemonic from 'ui/ShowMnemonic'
import {getWallet} from 'redux/actions'
import watchWallet from 'bitcoin/watchWallet'
import Icon from 'assets/spidchain-icon'
import db from 'db'

const spidButton = {
  //backgroundColor: 'grey',
  border: 'none',
  color: 'white',
  // textAlign: 'center',
  // textDecoration: 'none',
  //display: 'inline-block',
  // fontSize: '16px',
  //margin: '4px 2px',
  cursor: 'pointer',
  transitionDuration: '0.4s'
}


  /*
.spidButton:hover {
    box-shadow: 0 12px 16px 0 rgba(0,0,0,0.24),0 17px 50px 0 rgba(0,0,0,0.19);
}
*/
const network = networks[process.env.network]

const GenerateWallet = createReactClass({
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

  async checkWords (words) {
    if (this.state.mnemonic !== words.join(' ')) {
      this.setState({mismatch: true})
      NotificationManager.error('Words do not match', 'Error!', 5000)
      return
    }

    this.setState({mismatch: false})
    this.setState.step = 'done'
    const wallet = createHDWallet(this.state.mnemonic)
    await db.wallet.add({root: wallet})
    const dispatch = this.props.dispatch
    dispatch(getWallet()).then(({value}) => {
      const root = value.root
      const wallet = HDNode.fromBase58(root, network)
      const fundingKeyPair = wallet.derivePath("m/44'/0'/0'/0/0").keyPair
      const receivingAddress = fundingKeyPair.getAddress()
       watchWallet(dispatch)({receivingAddress})
    })
    // this.props.onWallet(createHDWallet(this.state.mnemonic))
  },

  render () {
    const state = this.state

    switch (state.step) {
      case 'start':
        return (
          <Container fluid>
            <Row className='mt-3'>
              <Col md='6' className='mx-auto'>
                <button style={spidButton} className='w-25 align-middle d-inline mx-auto mt-3'>
                  <Icon className='mt-3' alt='SpidChain icon' />
                </button>
              </Col>
            </Row>
            <Row className='mt-3'>
              <Col md='6' className='mx-auto'>
                <Button color='primary' block onClick={this.generateWallet}>
                  Activate
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

export default connect(s => s)(GenerateWallet)

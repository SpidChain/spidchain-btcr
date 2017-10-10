import axios from 'axios'
import React from 'react'
import createReactClass from 'create-react-class'
import {
  Button,
  Container,
  Col,
  Jumbotron,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row
} from 'reactstrap'
import {NotificationManager} from 'react-notifications'
import {connect} from 'react-redux'
import uuid from 'uuid'

import signClaim from 'bitcoin/signClaim'

const LoginAuthorization = createReactClass({
  getInitialState: () => ({
    formId: uuid(),
    modal: false,
    url: null
  }),

  handleScan (err, data) {
    if (err) {
      switch (err.name) {
        case 'SCAN_CANCELED':
          console.error('The scan was canceled before a valide QR code was found')
          return
        default:
          NotificationManager.error('Scanning failed', '', 5000)
          console.error(err)
          return
      }
    }
    console.log('Scanned: ', data)
    window.QRScanner.pausePreview()
    this.setState({
      modal: true,
      url: new window.URL(data)
    })
  },

  close () {
    window.QRScanner.resumePreview()
    window.QRScanner.scan(this.handleScan)
    this.setState({
      modal: false,
      url: null
    })
  },

  async sendClaims () {
    const {url} = this.state

    if (!url) {
      return
    }

    const signup = url.searchParams.get('signup') === 'true'
    const otherClaims = []

    if (signup) {
      otherClaims.push(this.props.ownClaims.data[0].signedDocument)
    }

    const walletRoot = this.props.wallet.root
    const controlAccount = Number(process.env.controlAccount)
    const ownerRoot = walletRoot.derivePath("m/44'/0'")
    .deriveHardened(controlAccount)
    .derive(0)

    const rotationIx = 0
    const claim = {
      'http://schema.org/url': url.toString()
    }

    try {
      document.getElementById(this.state.formId).reset()
      const signedDocument = await signClaim({claim, ownerRoot, rotationIx, did: this.props.did.did})
      await axios.post(url.toString(), {
        loginClaim: signedDocument,
        otherClaims
      })
      NotificationManager.success('Login authorized', 'Login authorized', 5000)
      this.close()
    } catch (e) {
      NotificationManager.error('Error', '', 5000)
      console.error(e)
    }
  },

  componentDidMount: function () {
    window.QRScanner.show()
    window.QRScanner.scan(this.handleScan)
  },

  componentWillUnmount: function () {
    window.QRScanner.destroy()
  },

  render () {
    const {url} = this.state
    const signup = url
      ? url.searchParams.get('signup') === 'true'
      : null
    return (
      <div>
        {url
          ? (
            <Modal isOpen={this.state.modal} toggle={this.close}>
              <ModalHeader toggle={this.close}>
                {signup ? 'Signup' : 'Login'} to {url.hostname}
              </ModalHeader>
              <ModalBody>
                {signup
                  ? <div>
                    <p>
                      <strong>{url.hostname}</strong> is requesting you to send information about your:
                    </p>
                    <ul>
                      <li>First Name</li>
                      <li>Last Name</li>
                    </ul>
                  </div>
                  : <p>
                    <strong>{url.hostname}</strong> is requesting authorization to login.
                  </p>
                }
              </ModalBody>
              <ModalFooter>
                <Button color='primary' onClick={this.sendClaims}>Accept</Button>{' '}
                <Button color='secondary' onClick={this.close}>Cancel</Button>
              </ModalFooter>
            </Modal>
          )
          : null
        }

        <Container fluid>
          <Row className='mt-3'>
            <Col md='6' className='mx-auto'>
              <Jumbotron>
                <h6 className='mb-0 lead text-center'>
                  <strong> Scan QRcode to authorize login </strong>
                </h6>
              </Jumbotron>
            </Col>
          </Row>
        </Container>
      </div>
    )
  }
})

export default connect(s => s)(LoginAuthorization)

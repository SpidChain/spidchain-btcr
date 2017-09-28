import axios from 'axios'
import React from 'react'
import createReactClass from 'create-react-class'
import {
  Button,
  Container,
  Col,
  Form,
  FormGroup,
  Input,
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

  onScan (e) {
    e.preventDefault()
    const form = e.target
    const value = form.url.value.trim()
    if (value === '') {
      return
    }

    this.setState({
      modal: true,
      url: new window.URL(value)
    })
  },

  close () {
    this.setState({
      modal: false,
      url: null
    })
  },

  async sendClaims (e) {
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
      this.close()
      const signedDocument = await signClaim({claim, ownerRoot, rotationIx, did: this.props.did.did})
      await axios.post(url.toString(), {
        loginClaim: signedDocument,
        otherClaims
      })
      NotificationManager.success('Login authorized', 'Login authorized', 5000)
    } catch (e) {
      NotificationManager.error('Error', '', 5000)
      console.error(e)
    }
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
                      <li>Name</li>
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
                <p className='lead text-center'>
                  <strong>Insert url to authorize login</strong>
                </p>
              </Jumbotron>
            </Col>
          </Row>
          <Row className='mt-3'>
            <Col md='6' className='mx-auto'>
              <Form
                id={this.state.formId}
                autoCorrect='off'
                autoComplete='off'
                onSubmit={this.onScan}>
                <FormGroup>
                  <Input
                    type='text'
                    name='url'
                    placeholder='URL'
                    autoCapitalize='none' />
                </FormGroup>
                <Button type='submit' block color='primary'> Authorize login </Button>
              </Form>
            </Col>
          </Row>
        </Container>
      </div>
    )
  }
})

export default connect(s => s)(LoginAuthorization)

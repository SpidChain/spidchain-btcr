import axios from 'axios'
import React from 'react'
import {
  Button,
  Container,
  Col,
  Form,
  FormGroup,
  Input,
  Jumbotron,
  Row
} from 'reactstrap'
import {NotificationManager} from 'react-notifications'
import {connect} from 'react-redux'

import signClaim from 'bitcoin/signClaim'

const onSubmit = (did, wallet) => async e => {
  e.preventDefault()
  const form = e.target
  const url = form.url.value.trim()
  if (url === '') {
    return
  }

  const walletRoot = wallet.root
  const controlAccount = Number(process.env.controlAccount)
  const ownerRoot = walletRoot.derivePath("m/44'/0'")
  .deriveHardened(controlAccount)
  .derive(0)

  const rotationIx = 0
  const claim = {
    'http://schema.org/url': url
  }

  try {
    const signedDocument = await signClaim({claim, ownerRoot, rotationIx, did})
    console.log(url);
    console.log(signedDocument);
    await axios.post(url, signedDocument)
    NotificationManager.success('Login authorized', 'Login authorized', 5000)
  } catch (e) {
    NotificationManager.error('Error', '', 5000)
    console.error(e)
  }

  form.reset()
}

const LoginAuthorization = ({did, wallet}) => (
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
          autoCorrect='off'
          autoComplete='off'
          onSubmit={onSubmit(did.did, wallet)}>
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
)

export default connect(s => s)(LoginAuthorization)

import React from 'react'
import {
  Button, Container, Col, Form,
  FormGroup, Input, Jumbotron, Row} from 'reactstrap'

const getSecureRandom = () => {
  const array = new Uint32Array(1)
  window.crypto.getRandomValues(array)
  return array[0]
}

const onSubmit = senderDid => async e => {
  e.preventDefault()
  const form = e.target
  const receiverDid = form.did.value
  const nonce = getSecureRandom()
  if (receiverDid === '') {
    return
  }
  try {
    // TODO: update with apollo
    // await Meteor.callPromise('messaging.sendChallenge', {senderDid, receiverDid, nonce})
  } catch (e) {
    console.error(e)
    return
  }
  window.localStorage.setItem(receiverDid, JSON.stringify({nonce, verified: false}))
  form.reset()
}

const AddContact = ({did}) => {
  return (
    <Container fluid>
      <Row className='mt-3'>
        <Col md='6' className='mx-auto'>
          <Jumbotron>
            <p className='lead'>
              Insert a friends's DID here, he will receive a confirmation request
            </p>
          </Jumbotron>
        </Col>
      </Row>
      <Row className='mt-3'>
        <Col md='6' className='mx-auto'>
          <Form
            autoCorrect='off'
            autoComplete='off'
            onSubmit={onSubmit(did)}>
            <FormGroup>
              <Input
                type='text'
                name='did'
                placeholder='DID'
                autoCapitalize='none' />
            </FormGroup>
            <Button type='submit' block color='primary'> Send Request </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  )
}

export default AddContact

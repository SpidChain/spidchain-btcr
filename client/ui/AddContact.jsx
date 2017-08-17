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
import gql from 'graphql-tag'
import {NotificationManager} from 'react-notifications'
import {getSentRequests} from 'redux/actions'
import {connect} from 'react-redux'

import db from 'db'
import client from 'apollo'

const getSecureRandom = () => {
  // TODO: now using Uint16Array because of problem with indexedDb,
  // replace with Uint32Array
  const array = new Uint16Array(1)
  window.crypto.getRandomValues(array)
  return array[0]
}

const sendOwnershipRequest = gql`
  mutation sendOwnershipRequest($senderDid: String, $receiverDid: String, $nonce: Int) {
    sendOwnershipRequest(senderDid: $senderDid, receiverDid: $receiverDid, nonce: $nonce) {
     _id
  }
}`

const onSubmit = ({senderDid, dispatch}) => async e => {
  e.preventDefault()
  const form = e.target
  const receiverDid = form.did.value.trim()
  if (receiverDid === '') {
    return
  }
  const nonce = getSecureRandom()
  try {
    const {data: {sendOwnershipRequest: {_id}}} =
      await client.mutate({mutation: sendOwnershipRequest, variables: {senderDid, receiverDid, nonce}})
    await db.sentRequests.add({_id, receiverDid, nonce, verified: 'false'})
    dispatch(getSentRequests())
    NotificationManager.success('DID: ' + receiverDid, 'Message sent', 5000)
  } catch (e) {
    NotificationManager.error(e.message, 'Message not sent', 5000)
    console.error(e)
    return
  }
  form.reset()
}

const AddContact = ({did, dispatch}) => {
  return (
    <Container fluid>
      <Row className='mt-3'>
        <Col md='6' className='mx-auto'>
          <Jumbotron>
            <p className='lead text-center'>
              <strong>Insert a DID here, the owner will receive a confirmation request</strong>
            </p>
          </Jumbotron>
        </Col>
      </Row>
      <Row className='mt-3'>
        <Col md='6' className='mx-auto'>
          <Form
            autoCorrect='off'
            autoComplete='off'
            onSubmit={onSubmit({senderDid: did, dispatch})}>
            <FormGroup>
              <Input
                type='text'
                name='did'
                maxLength='27'
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

export default connect(({did}) => did)(AddContact)

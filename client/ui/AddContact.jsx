import React from 'react'
import {
  Button, Container, Col, Form,
  FormGroup, Input, Jumbotron, Row} from 'reactstrap'
import { gql, graphql } from 'react-apollo'
import localforage from 'localforage'
window.localforage = localforage

const getSecureRandom = () => {
  const array = new Uint16Array(1)
  window.crypto.getRandomValues(array)
  return array[0]
}

const sendChallenge = gql`
mutation addContact($senderDid: String, $receiverDid: String, $nonce: Int) {
  sendChallenge(senderDid: $senderDid, receiverDid: $receiverDid, nonce: $nonce) {
    _id
  }
}`

const onSubmit = ({senderDid, mutate}) => async e => {
  e.preventDefault()
  const form = e.target
  const receiverDid = form.did.value
  if (receiverDid === '') {
    return
  }
  const nonce = getSecureRandom()
  try {
    // This simulates a p2p call
      const a = await mutate({
        variables: {senderDid, receiverDid, nonce},
        //  refetchQueries: [{query: posts}]
      })
    console.log(a)
    localforage.setItem(receiverDid, {nonce, verified: false})
  } catch (e) {
    console.error(e)
    return
  }
  form.reset()
}

const AddContact = ({did, mutate}) => {
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
            onSubmit={onSubmit({senderDid: did, mutate})}>
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

export default graphql(sendChallenge)(AddContact)

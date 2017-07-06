import {Meteor} from 'meteor/meteor'
import React from 'react'
import {Button, Container, Form, FormGroup, Input, Jumbotron} from 'reactstrap'

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
    await Meteor.callPromise('messaging.sendChallenge', {senderDid, receiverDid, nonce})
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
      <Jumbotron>
        <h1 className='display-3'>Add a contact</h1>
        <p className='lead'>
          Insert a friends's DID here, he will receive a confirmation request
        </p>
      </Jumbotron>
      <Form onSubmit={onSubmit(did)}>
        <FormGroup>
          <Input
            type='text'
            name='did'
            placeholder='DID' />
        </FormGroup>
        <Button type='submit' block color='primary'> Send Request </Button>
      </Form>
    </Container>
  )
}

export default AddContact

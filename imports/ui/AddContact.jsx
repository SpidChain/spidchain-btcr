import {Meteor} from 'meteor/meteor'
import React from 'react'
import {Button, Form, Input} from 'reactstrap'

const getSecureRandom = () => {
  const array = new Uint32Array(1)
  window.crypto.getRandomValues(array)
  return array[0]
}

const onSubmit = senderDid => async e => {
  e.preventDefault()
  const receiverDid = e.target.did.value
  const nonce = getSecureRandom()
  if (receiverDid === '') {
    return
  }
  try {
    await Meteor.callPromise('sendChallenge', {senderDid, receiverDid, nonce})
  } catch (e) {
    console.error(e)
    return
  }
  window.localStorage(receiverDid, JSON.stringify({nonce, verified: false}))
}

const AddContact = ({did}) => {
  return (
    <Form onSubmit={onSubmit(did)}>
      <Input
        type='text'
        name='did'
        placeholder='did' />
      <Button type='submit'> Send Request </Button>
    </Form>
  )
}

export default AddContact

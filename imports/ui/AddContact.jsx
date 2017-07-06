import {Meteor} from 'meteor/meteor'
import React from 'react'
import {Button, Form, Input} from 'reactstrap'

const onSubmit = senderDid => async e => {
  e.preventDefault()
  const receiverDid = e.target.did.value
  const nonce = 999480349809348503
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

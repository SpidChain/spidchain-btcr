import client from 'apollo'
import createReactClass from 'create-react-class'
import React from 'react'
import {gql} from 'react-apollo'
import {NotificationManager} from 'react-notifications'
import {connect} from 'react-redux'
import {Button, Form, FormGroup, Input, Modal, ModalBody, ModalHeader} from 'reactstrap'

import db from 'db'
import {getOwnClaims} from 'redux/actions'

const sendClaimSignatureRequest = gql`
  mutation sendClaimSignatureRequest($senderDid: String, $receiverDid: String, $claim: String) {
    sendClaimSignatureRequest(senderDid: $senderDid, receiverDid: $receiverDid, claim: $claim) {
     _id
  }
}`

const Claim = createReactClass({
  getInitialState: () => ({
    modal: false
  }),

  toggle () {
    this.setState({
      modal: !this.state.modal
    })
  },

  async onSubmit (e) {
    e.preventDefault()
    const form = e.target
    const receiverDid = form.did.value.trim()
    if (receiverDid === '') {
      return
    }
    try {
      const {claim, claimId, did, dispatch} = this.props
      await client.mutate({mutation: sendClaimSignatureRequest, variables: {senderDid: did.did, receiverDid, claim: JSON.stringify(claim)}})
      const signers = (await db.claims.get(claimId)).signers
      signers.push({did: receiverDid, status: 'pending'})
      await db.claims.update(claimId, {signers})
      dispatch(getOwnClaims(did.did))
      NotificationManager.success('DID: ' + receiverDid, 'Message sent', 5000)
    } catch (e) {
      NotificationManager.error(e.message, 'Message not sent', 5000)
      console.error(e)
      return
    }
    form.reset()
  },

  render () {
    const {claim} = this.props
    return (
      <div>
        <p>
          Subject: {claim['@id']}
        </p>
        <div>
          {Object.keys(claim).filter(e => e !== '@context' && e !== '@id' && e !== 'https://w3id.org/security#signature')
            .map((key) => <p key={key}>{key}: {claim[key].toString()}</p>)}
        </div>
        <Button onClick={this.toggle}>Request signature</Button>
        <Modal isOpen={this.state.modal} toggle={this.toggle}>
          <ModalHeader toggle={this.toggle}>Request signature</ModalHeader>
          <ModalBody>
            <Form
              autoCorrect='off'
              autoComplete='off'
              onSubmit={this.onSubmit}
            >
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
          </ModalBody>
        </Modal>
      </div>
    )
  }
})

export default connect(s => s)(Claim)

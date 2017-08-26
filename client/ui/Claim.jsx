import client from 'apollo'
import createReactClass from 'create-react-class'
import React from 'react'
import Select from 'react-select'
import gql from 'graphql-tag'
import {NotificationManager} from 'react-notifications'
import {connect} from 'react-redux'
import {
  Button,
  Form,
  FormGroup,
  ListGroupItem,
  Modal,
  ModalBody,
  ModalHeader,
  Table
} from 'reactstrap'

import db from 'db'
import {getOwnClaims} from 'redux/actions'

const sendClaimSignatureRequest = gql`
  mutation sendClaimSignatureRequest($senderDid: String, $receiverDid: String, $claim: String) {
    sendClaimSignatureRequest(senderDid: $senderDid, receiverDid: $receiverDid, claim: $claim) {
     _id
  }
}`

const getDids = async () => {
  const sent = await db.sentRequests.toArray()
  const options = sent.map(e => ({value: e.receiverDid, label: e.receiverDid}))
  return {options}
}

const Claim = createReactClass({
  getInitialState: () => ({
    modal: false,
    value: undefined
  }),

  toggle () {
    this.setState({
      modal: !this.state.modal
    })
  },

  async onSubmit (e) {
    e.preventDefault()
    const form = e.target
    if (!form.did || !form.did.value) {
      return
    }
    const receiverDid = form.did.value
    console.log('receiverDid', receiverDid)
    try {
      const {claim, claimId, did, dispatch} = this.props
      console.log('receiverDid', receiverDid)
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
      <ListGroupItem>
        <Table>
          <tbody>
            <tr>
              <th>
                Subject
              </th>
              <td>
                {claim['@id']}
              </td>
            </tr>
            {Object.keys(claim)
                .filter(e => e !== '@context' &&
                  e !== '@id' &&
                  e !== 'https://w3id.org/security#signature')
                .map(key => (
                  <tr key={key}>
                    <th> {key} </th>
                    <td >
                      {claim[key].toString()}
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </Table>
        <Button block outline color='primary' onClick={this.toggle}>Request signature</Button>
        <Modal isOpen={this.state.modal} toggle={this.toggle}>
          <ModalHeader toggle={this.toggle}>Request signature</ModalHeader>
          <ModalBody>
            <Form
              autoCorrect='off'
              autoComplete='off'
              onSubmit={this.onSubmit}
            >
              <FormGroup>
                <Select.Async
                  name='did'
                  placeholder='Send to...'
                  value={this.state.selected}
                  loadOptions={getDids}
                  onChange={(selected) => this.setState({selected})}
                />
              </FormGroup>
              <Button type='submit' block color='primary'> Send Request </Button>
            </Form>
          </ModalBody>
        </Modal>
      </ListGroupItem>
    )
  }
})

export default connect(s => s)(Claim)

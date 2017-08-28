import client from 'apollo'
import createReactClass from 'create-react-class'
import React from 'react'
import Select from 'react-select'
import gql from 'graphql-tag'
import {NotificationManager} from 'react-notifications'
import {connect} from 'react-redux'
import {
  Badge,
  Button,
  Form,
  FormGroup,
  ListGroupItem,
  Modal,
  ModalBody,
  ModalHeader,
  Table
} from 'reactstrap'
import _ from 'lodash'

import db from 'db'
import {getOwnClaims} from 'redux/actions'

const sendClaimSignatureRequest = gql`
  mutation sendClaimSignatureRequest(
    $senderDid: String,
    $receiverDid: String,
    $claimId: Int,
    $claim: String) {
      sendClaimSignatureRequest(
        senderDid: $senderDid,
        receiverDid: $receiverDid,
        claimId: $claimId,
        claim: $claim) {
          _id
  }
}`

const getDids = async () => {
  const sent = await db.sentRequests.toArray()
  const options = sent.map(e => ({value: e.receiverDid, label: e.receiverDid}))
  return {options}
}

const OwnClaim = createReactClass({
  getInitialState: () => ({
    modal: false,
    value: undefined
  }),

  toggle () {
    this.setState({
      modal: !this.state.modal
    })
  },

  async requestSignature (e) {
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
      // const purgedClaim = claim with
      const signatures = claim['https://w3id.org/security#signature']
      if (_.isArray(signatures)) {
        claim['https://w3id.org/security#signature'] = signatures[0]
      }

      await client.mutate({
        mutation: sendClaimSignatureRequest,
        variables: {
          senderDid: did.did,
          receiverDid,
          claimId,
          claim: JSON.stringify(claim)
        }
      })
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
    const {claim, signers, did: {did}} = this.props
    return (
      <ListGroupItem>
        <Table>
          <tbody>
            <tr>
              <th>
                subject
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
            <tr>
              <th>
                signers
              </th>
              <td>
                <ul style={{listStyleType: 'none'}}> {
                  signers
                  .filter(signer => {
                    return signer.did !== did
                  }).map(({did:signerDid, status}, i) => {
                    return status === 'pending'
                      ? <li key={i}> <Badge color='warning'> {signerDid} </Badge> </li>
                      : <li key={i}> <Badge color='success'> {signerDid} </Badge> </li>
                  })
                } </ul>
            </td>
          </tr>
        </tbody>
      </Table>
      <Button block outline color='primary' onClick={this.toggle}>Request signature</Button>
      <Modal isOpen={this.state.modal} toggle={this.toggle}>
        <ModalHeader toggle={this.toggle}>Request signature</ModalHeader>
        <ModalBody>
          <Form
            autoCorrect='off'
            autoComplete='off'
            onSubmit={this.requestSignature}
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

export default connect(s => s)(OwnClaim)

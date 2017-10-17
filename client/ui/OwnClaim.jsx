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

import {addPending} from 'dbUtils'
import {getOwnClaims} from 'redux/actions'

const sendClaimSignatureRequest = gql`
  mutation sendClaimSignatureRequest(
    $senderDid: String,
    $receiverDid: String,
    $claimId: String,
    $claim: String) {
      sendClaimSignatureRequest(
        senderDid: $senderDid,
        receiverDid: $receiverDid,
        claimId: $claimId,
        claim: $claim) {
          _id
  }
}`

const getDids = (myKnowsClaims, myDid) => {
  return myKnowsClaims.data
    .filter(({subjects, signers}) => _.difference(subjects, signers).length === 0)
    .map(({subjects}) => {
      const [contact] = subjects.filter(e => e !== myDid)
      return {value: contact, label: contact}
    })
}

const OwnClaim = createReactClass({
  getInitialState: () => ({
    modal: false,
    selected: null
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
    try {
      const {claim, claimId, did, dispatch} = this.props
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
      const added = await addPending(claimId, receiverDid)
      if (!added) {
        NotificationManager.error('Signature request already sent')
      }
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
    const {claim, signers, pending, did: {did}} = this.props
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
                  signers.concat(pending)
                  .filter(signer => signer !== did)
                  .map((signer, i) =>
                    <li key={i}>
                      <Badge color={i >= signers.length - 1 ? 'warning' : 'success'}>
                        {signer}
                      </Badge>
                    </li>
                  )
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
                <Select
                  name='did'
                  placeholder='Send to...'
                  value={this.state.selected}
                  options={getDids(this.props.myKnowsClaims, did)}
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

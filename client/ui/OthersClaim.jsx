import createReactClass from 'create-react-class'
import React from 'react'
import gql from 'graphql-tag'
import {NotificationManager} from 'react-notifications'
import {connect} from 'react-redux'
import {
  Button,
  ListGroupItem,
  Table
} from 'reactstrap'
import client from 'apollo'

import signClaim from 'bitcoin/signClaim'
import db from 'db'

const sendClaimSignature = gql`
  mutation sendClaimSignature(
    $senderDid: String,
    $receiverDid: String,
    $claimId: String,
    $claimSignature: String) {
      sendClaimSignature(
        senderDid: $senderDid,
        receiverDid: $receiverDid,
        claimId: $claimId,
        claimSignature: $claimSignature) {
          _id
        }
}`

const OthersClaim = createReactClass({
  async onClick (e) {
    const {claim, claimId, subjects, did: {did}, dispatch, wallet} = this.props
    const walletRoot = wallet.root
    const controlAccount = Number(process.env.controlAccount)
    const ownerRoot = walletRoot.derivePath("m/44'/0'")
      .deriveHardened(controlAccount)
      .derive(0)

    const rotationIx = 0
    try {
      const signedDocument = await signClaim({claim, ownerRoot, rotationIx, did})
      const claimSignatures = signedDocument['https://w3id.org/security#signature']
      console.log('Claim:', claimSignatures[1])
      const signature = claimSignatures[1]
      await client.mutate({
        mutation: sendClaimSignature,
        variables: {
          senderDid: did,
          claimId,
          receiverDid: subjects[0],
          claimSignature: JSON.stringify(signature)
        }
      })
      await db.sigRequests.delete(claimId)
      NotificationManager.success('', 'Signature sent', 5000)
      // dispatch(getOwnClaims(did))
    } catch (e) {
      NotificationManager.error(e.message, 'Signature not sent', 5000)
      console.error(e)
    }
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
                .map(key =>
                  <tr key={key}>
                    <th> {key} </th>
                    <td >
                      {claim[key].toString()}
                    </td>
                  </tr>)
            }
          </tbody>
        </Table>
        <Button block outline color='primary' onClick={this.onClick}>
          Sign
        </Button>
        <Button block outline color='danger' onClick={() => 0}>
          Reject
        </Button>
      </ListGroupItem>
    )
  }
})

export default connect(s => s)(OthersClaim)

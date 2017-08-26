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

import signClaim from 'bitcoin/signClaim'
import db from 'db'

const sendClaimSignatureRequest = gql`
  mutation sendClaimSignatureRequest($senderDid: String, $receiverDid: String, $claim: String) {
    sendClaimSignatureRequest(senderDid: $senderDid, receiverDid: $receiverDid, claim: $claim) {
     _id
  }
}`

const OthersClaim = createReactClass({
  async onClick (e) {
    const {claim, did: {did}, dispatch, wallet} = this.props
    const walletRoot = wallet.root
    const controlAccount = Number(process.env.controlAccount)
    const ownerRoot = walletRoot.derivePath("m/44'/0'")
      .deriveHardened(controlAccount)
      .derive(0)

    const rotationIx = 0
    try {
      const signedDocument = await signClaim({claim, ownerRoot, rotationIx, did})
      console.log('Claim:', signedDocument)
      /*
    await db.claims.add({
      subject: did,
      signedDocument,
      signers: [
        {did, status: 'signed'}
      ]
    })
    */
      // dispatch(getOwnClaims(did))
    } catch (e) {
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
      </ListGroupItem>
    )
  }
})

export default connect(s => s)(OthersClaim)

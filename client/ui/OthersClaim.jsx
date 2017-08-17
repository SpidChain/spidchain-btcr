import createReactClass from 'create-react-class'
import React from 'react'
import {gql} from 'react-apollo'
import {NotificationManager} from 'react-notifications'
import {connect} from 'react-redux'
import {Button, Form, FormGroup, Input, Modal, ModalBody, ModalHeader} from 'reactstrap'

import signClaim from 'bitcoin/signClaim'
import db from 'db'
import {getOwnClaims} from 'redux/actions'

const sendClaimSignatureRequest = gql`
  mutation sendClaimSignatureRequest($senderDid: String, $receiverDid: String, $claim: String) {
    sendClaimSignatureRequest(senderDid: $senderDid, receiverDid: $receiverDid, claim: $claim) {
     _id
  }
}`

const OthersClaim = createReactClass({
  async onClick (e) {
    const {claim, did, dispatch, wallet} = this.props
    const walletRoot = wallet.root
    const controlAccount = Number(process.env.controlAccount)
    const ownerRoot = walletRoot.derivePath("m/44'/0'")
      .deriveHardened(controlAccount)
      .derive(0)

    const rotationIx = 0
    try {
      const signedDocument = await signClaim(claim, ownerRoot, rotationIx)
      console.log('Claim:', signedDocument);
    /*
    await db.claims.add({
      subject: did,
      signedDocument,
      signers: [
        {did, status: 'signed'}
      ]
    })
    */
    //dispatch(getOwnClaims(did))
    } catch (e) {
      console.error(e)
    }
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
        <Button onClick={this.onClick} block>Sign</Button>
      </div>
    )
  }
})

export default connect(s => s)(OthersClaim)

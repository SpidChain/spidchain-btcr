import React from 'react'
import {connect} from 'react-redux'
import {Button, ListGroupItem} from 'reactstrap'
import gql from 'graphql-tag'

import signWithOwnerKey256 from 'bitcoin/sign'
import db from 'db'
import client from 'apollo'
import {getReceivedRequests} from 'redux/actions'

// global.Buffer = global.Buffer || require('buffer').Buffer
// const {HDNode, networks} = require('bitcoinjs-lib')

// const network = networks[process.env.network]

const sendOwnershipProof = gql`
mutation sendOwnershipProof($senderDid: String, $receiverDid: String, $signature: String) {
   sendOwnershipProof(senderDid: $senderDid, receiverDid: $receiverDid, signature: $signature) {
         _id
   }
}`

const handleClick = ({_id, did, senderDid, nonce, root, dispatch}) => async () => {
  // TODO: rotationIx should be a variable from the redux store
  const signature = signWithOwnerKey256({walletRoot: root, msg: nonce, rotationIx: 0})
  try {
    await client.mutate({
      mutation: sendOwnershipProof,
      variables: {senderDid, receiverDid: did, signature}
    })
    await db.receivedRequests.update(_id, {verified: true})
    // TODO: there may be a race condition with remote requests from db
    dispatch(getReceivedRequests())
  } catch (e) {
    console.error(e)
  }
}

const RequestItem = ({_id, did: {did}, nonce, senderDid, wallet: {root}, dispatch}) => {
  // const walletRoot = HDNode.fromBase58(wallet, network)
  return (
    <ListGroupItem className='justify-content-between'>
      {senderDid}
      <Button color='primary'
        onClick={handleClick({_id, did, senderDid, nonce, root, dispatch})}>
        Confirm
      </Button>
    </ListGroupItem>
  )
}

export default connect(s => s)(RequestItem)

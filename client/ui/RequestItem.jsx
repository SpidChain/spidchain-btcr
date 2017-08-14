import React from 'react'
import {Button, ListGroupItem} from 'reactstrap'
import {gql, graphql} from 'react-apollo'
import sign256 from 'bitcoin/sign'

global.Buffer = global.Buffer || require('buffer').Buffer
const {HDNode, networks} = require('bitcoinjs-lib')

const network = networks[process.env.network]

const signRequest = gql`
mutation sendChallengeResponse($senderDid: String, $receiverDid: String, $signature: String) {
   sendChallengeResponse(senderDid: $senderDid, receiverDid: $receiverDid, signature: $signature) {
         _id
   }
}`

const handleClick = ({did, senderDid, nonce, walletRoot, mutation}) => async () => {
  const signature = sign256({walletRoot, ownerAccount: 2, msg: nonce, rotationIx: 0})
  try {
   await mutate(
    {variables: {did}}
    )
  dispatch(signRequest(signature))
  } catch (e) {
  }
  try {
    // TODO: Update to meteor
    /*
    await Meteor.callPromise('messaging.sendChallengeResponse', {
      senderDid,
      receiverDid: did,
      nonce,
      signature
    })
    */
  } catch (e) {
    console.error(e)
  }
}

const RequestItem = ({did, nonce, senderDid, wallet, mutation}) => {
  const walletRoot = HDNode.fromBase58(wallet, network)
  return (
    <ListGroupItem>
      {senderDid}
      <Button color='success' className='float-right'
        onClick={handleClick({did, senderDid, nonce, walletRoot})}>
        <span className='fa fa-check' />
      </Button>
    </ListGroupItem>
  )
}

export default graphql(signRequest)(RequestItem)

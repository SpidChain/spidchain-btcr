import {Meteor} from 'meteor/meteor'
import React from 'react'
import {Button, ListGroupItem} from 'reactstrap'

import sign256 from '/imports/bitcoin/sign'

global.Buffer = global.Buffer || require('buffer').Buffer
const {HDNode, networks} = require('bitcoinjs-lib')

const network = networks[Meteor.settings.public.network]

const handleClick = ({did, senderDid, nonce, walletRoot}) => async () => {
  const signature = sign256({walletRoot, ownerAccount: 2, msg: nonce, rotationIx: 0})

  try {
    await Meteor.callPromise('messaging.sendChallengeResponse', {
      senderDid,
      receiverDid: did,
      nonce,
      signature
    })
  } catch (e) {
    console.error(e)
  }
}

const RequestItem = ({did, nonce, senderDid, wallet}) => {
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

export default RequestItem

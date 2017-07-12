import React from 'react'
import {Button} from 'reactstrap'
import {Meteor} from 'meteor/meteor'
import {NotificationManager} from 'react-notifications'

import createDID from '/imports/bitcoin/createDID'
import ddo from '/imports/bitcoin/ddo'
import sendRawTransaction from '/imports/bitcoin/sendRawTransaction'

const create = async ({
  onDID,
  walletRoot,
  fundingKeypair,
  ownerPubKey,
  recoveryAddress
}) => {
  const fundingAddress = fundingKeypair.getAddress()
  const amount = 1000
  const utxos = await Meteor.callPromise('blockexplorer.utxo', fundingAddress)
  const ddoData = ddo({pubKeys: [ownerPubKey]})
  const ddoJSON = JSON.stringify(ddoData)
  let ddoHash
  try {
    [{hash: ddoHash}] = await Meteor.callPromise('ipfs.add', ddoJSON)
  } catch (e) {
    NotificationManager.error(e.toString(), 'IPFS error', 5000)
    console.error(e)
    return
  }
  let didTx
  try {
    didTx = await createDID({
      controlAccount: 1,
      ddoHash,
      walletRoot,
      fundingKeypair,
      amount,
      recoveryAddress,
      utxos
    })
  } catch (e) {
    NotificationManager.error(e.toString(), 'DID creation failed', 5000)
    console.error(e)
    return
  }
  try {
    await sendRawTransaction(didTx.toHex())
  } catch (e) {
    NotificationManager.error(e.toString(), 'Could not write DID transaction to the blockchain', 5000)
    console.error(e)
    return
  }
  onDID(didTx)
}

const CreateIdentity = (props) => (
  <Button color='primary' block onClick={() => create(props)}>
    Create identity
  </Button>
)

export default CreateIdentity

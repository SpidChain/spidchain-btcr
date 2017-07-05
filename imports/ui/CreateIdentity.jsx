import React from 'react'
import {Button} from 'reactstrap'
import {Meteor} from 'meteor/meteor'

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
  const [{hash: ddoHash}] = await Meteor.callPromise('ipfs.add', ddoJSON)
  const didTx = await createDID({
    controlAccount: 1,
    ddoHash,
    walletRoot,
    fundingKeypair,
    amount,
    recoveryAddress,
    utxos
  })

  await sendRawTransaction(didTx.toHex())
  onDID(didTx)
}

const CreateIdentity = (props) => (
  <Button color='primary' onClick={() => create(props)}>
    Create identity
  </Button>
)

export default CreateIdentity

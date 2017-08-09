import React from 'react'
import {Button} from 'reactstrap'
// import {NotificationManager} from 'react-notifications'

import {makeDID} from 'bitcoin/DID'
// import ddo from '/imports/bitcoin/ddo'
// import sendRawTransaction from '/imports/bitcoin/sendRawTransaction'

const handleDIDCreation = async ({walletRoot, fundingKeyPair, recoveryAddress, setDID}) => {
  const controlRoot = walletRoot.derivePath("m/44'/0'")
    .deriveHardened(Number(process.env.controlAccount))
    .derive(0)
  const claimsRoot = walletRoot.derivePath("m/44'/0'")
    .deriveHardened(Number(process.env.claimsAccount))
    .derive(0)
  const controlBond = Number(process.env.controlBond)
  const recoveryAmount = Number(process.env.recoveryAmount)
  const {txId1, txId2} = await makeDID({
    claimsRoot,
    controlBond,
    controlRoot,
    fundingKeyPair,
    recoveryAddress,
    recoveryAmount
  })
  setDID({txId1, txId2})
}

/*
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
  let tx1, tx2
  try {
    {tx1, tx2} = await makeDIDTxs({
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
    await sendRawTransaction(tx1.toHex())
    await sendRawTransaction(tx2.toHex())
  } catch (e) {
    NotificationManager.error(e.toString(), 'Could not write DID transaction to the blockchain', 5000)
    console.error(e)
    return
  }
  onDID(tx1)
}
*/

const CreateDID = (props) => (
  <Button color='primary' block onClick={() => handleDIDCreation(props)}>
    Create identity
  </Button>
)

export default CreateDID

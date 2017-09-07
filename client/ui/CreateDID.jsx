import React from 'react'
import {connect} from 'react-redux'
import {Button} from 'reactstrap'
import {NotificationManager} from 'react-notifications'

import {makeDID} from 'bitcoin/DID'
import db from 'db'
import {getDid} from 'redux/actions'
import {watchUnconfirmed} from 'redux/store'

const handleDIDCreation = async ({root, recoveryAddress, dispatch}) => {
  const controlRoot = root.derivePath("m/44'/0'")
    .deriveHardened(Number(process.env.controlAccount))
    .derive(0)
  const claimsRoot = root.derivePath("m/44'/0'")
    .deriveHardened(Number(process.env.claimsAccount))
    .derive(0)
  const controlBond = Number(process.env.controlBond)
  const recoveryAmount = Number(process.env.recoveryAmount)
  // TODO: factor fundingKeyPair out, maybe put it in the walletdb
  const fundingKeyPair = root.derivePath("m/44'/0'/0'/0/0").keyPair
  let txId1
  try {
    const res = await makeDID({
      claimsRoot,
      controlBond,
      controlRoot,
      fundingKeyPair,
      recoveryAddress,
      recoveryAmount
    })
    txId1 = res.txId1
  } catch (e) {
    NotificationManager.error(e.message, 'DID not created', 5000)
    console.error(e)
    return
  }
  await db.did.add({txId1, unconfirmedDID: txId1})
  dispatch(getDid())
  watchUnconfirmed({txId1})
}

const CreateDID = ({
  wallet: {root, recoveryAddress},
  did,
  balance,
  dispatch
}) => {
  const hasCredit = balance && balance > 0.001
  console.log(balance)
  const isDidUnconfirmed = did && did.unconfirmedDID && true
  return (
    <Button disabled={!hasCredit || isDidUnconfirmed} color='primary' block onClick={() => handleDIDCreation({
      root, recoveryAddress, dispatch
    })}>
      { isDidUnconfirmed
        ? 'Waiting confirmation'
        : 'Create identity'
      }
    </Button>
  )
}

export default connect(s => s)(CreateDID)

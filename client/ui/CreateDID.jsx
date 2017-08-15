import React from 'react'
import {connect} from 'react-redux'
import {Button} from 'reactstrap'
// import {NotificationManager} from 'react-notifications'

import {makeDID} from 'bitcoin/DID'
// import ddo from '/imports/bitcoin/ddo'
// import sendRawTransaction from '/imports/bitcoin/sendRawTransaction'
import db from 'db'
import bitcoinRpc from 'bitcoin/bitcoinRpc'
import {getTxInfo} from 'utils/txUtils'
import {txrefEncode} from 'txref-conversion-js'
import {getDid} from 'redux/actions'

const CONFIRMATIONS = 1

export const watchUnconfirmed = ({txId1, dispatch}) => {
  const interval = 60000  // 1 minute
  const handle = setInterval(async () => {
    // const tx = await bitcoinRpc('bitcoin', 'getRawTransaction', txId, 1)
    const tx = await bitcoinRpc('getRawTransaction', txId1, 1)
    if (tx.confirmations >= CONFIRMATIONS) {
      const {height, ix} = await getTxInfo(txId1)
      const txRef = txrefEncode(process.env.network, height, ix)
      /*
        this.setState({
          did: txRef,
          didTxId: txId,
          unconfirmedDID: null
        })
        */
      // TODO: fix
      await db.did.update(txId1, {did: txRef, unconfirmedDID: null})
      dispatch(getDid())
      // window.localStorage.removeItem('unconfirmedDID')
      // window.localStorage.setItem('did', txRef)
      // window.localStorage.setItem('didTxId', txId)
      clearInterval(handle)
    }
  }, interval)
}

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
  const {txId1, txId2} = await makeDID({
    claimsRoot,
    controlBond,
    controlRoot,
    fundingKeyPair,
    recoveryAddress,
    recoveryAmount
  })
  await db.did.add({txId1, unconfirmedDID: txId1})
  dispatch(getDid())
  watchUnconfirmed({txId1, dispatch})
}

const CreateDID = ({
  wallet: {root, recoveryAddress},
  dispatch
}) => {
  return (
  <Button color='primary' block onClick={() => handleDIDCreation({
    root, recoveryAddress, dispatch
  })}>
    Create identity
  </Button>
)}

export default connect(s => s)(CreateDID)

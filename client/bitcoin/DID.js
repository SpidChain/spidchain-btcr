import _ from 'lodash'

import coinSelect from 'bitcoin/coinSelect'
import {makeExtendedDDO} from 'bitcoin/ExtendedDDO'
//import sendRawTransaction from 'bitcoin/sendRawTransaction'
import bitcoinRpc from 'bitcoin/bitcoinRpc'
import {listUtxos} from 'bitcoin/blockexplorerRpc'

global.Buffer = global.Buffer || require('buffer').Buffer
const bitcoin = require('bitcoinjs-lib')

const createFirstTransaction = ({
  changeAddress,
  controlAddress,
  controlBond,
  feeRate,
  fundingKeyPair,
  network,
  utxos
}) => {
  const targets = [
    {
      address: controlAddress,
      value: controlBond
    }
  ]
  const {inputs, outputs} = coinSelect(utxos, targets, feeRate)
  if (!inputs || !outputs) {
    // throw new Meteor.Error('makeDIDTxs', 'No funds in the address')
    throw new Error('makeDIDTxs', 'No funds in the address')
  }
  const txBuilder = new bitcoin.TransactionBuilder(network)
  // outputs of listUnspent
  _.each(inputs, input => {
    txBuilder.addInput(input.txid, input.vout)
  })
  _.each(outputs, output => {
    if (!output.address) { // this is the change address
      output.address = changeAddress
    }
    txBuilder.addOutput(output.address, output.value)
  })

  _.each(inputs, (input, i) => {
    txBuilder.sign(i, fundingKeyPair)
  })
  const tx = txBuilder.build()
  return tx
}

const createSecondTransaction = ({
  controlBond,
  controlKeyPair,
  extendedDDOUrl,
  feeRate,
  txId1,
  network,
  newControlAddress,
  recoveryAddress,
  recoveryAmount
}) => {
  // const oldControlKeypair = controlRoot.derive(0)
  // const controlKeyPair = controlRoot.derive(1)
  // const controlAddress = controlKeyPair.getAddress()

  /*
  const targets = [
    {
      address: controlAddress,
      value: controlBond
    }
  ]
  const {inputs, outputs} = coinSelect(utxos, targets, feeRate)
  if (!inputs || !outputs) {
    // throw new Meteor.Error('makeDIDTxs', 'No funds in the address')
    throw new Error('makeDIDTxs', 'No funds in the address')
  }
  */

  const txBuilder = new bitcoin.TransactionBuilder(network)
  txBuilder.addInput(txId1, 0)
  // 1st: Control key
  // TODO: this is a hack
  const estimatedTransactionSize = 300
  const newControlAmount = controlBond - (feeRate * estimatedTransactionSize) - recoveryAmount
  txBuilder.addOutput(newControlAddress, newControlAmount)
  // 2nd: Write DDO IPFS anchor in OP_RETURN
  const data = Buffer.from(extendedDDOUrl)
  const dataScript = bitcoin.script.nullData.output.encode(data)
  txBuilder.addOutput(dataScript, 0)
  // 3rd: Recovery key
  txBuilder.addOutput(recoveryAddress, recoveryAmount)
  txBuilder.sign(0, controlKeyPair)
  const tx = txBuilder.build()
  console.log('transaction 2: ', tx.getId())
  return tx
}

/*
 * Creates a new DID transaction
 *
 * @async
 * @function makeDIDTxs
 * @param {number} controlBond - The amount of bitcoins in the control address
 * @param {address} fundingKeyPair
 */

export const makeDIDTxs = async ({
  claimsRoot,
  controlBond,
  controlRoot,
  fundingKeyPair,
  recoveryAddress,
  recoveryAmount,
  utxos
}) => {
  const controlKeyPair = controlRoot.derive(0).keyPair
  const controlAddress = controlKeyPair.getAddress()
  const claimsKeyPair = claimsRoot.derive(0).keyPair
  const changeAddress = fundingKeyPair.getAddress()
  const feeRate = Number(process.env.feeRate)
  const network = bitcoin.networks[process.env.network]
  const tx1 = createFirstTransaction({
    changeAddress,
    controlBond,
    controlAddress,
    feeRate,
    fundingKeyPair,
    network,
    utxos
  })
  const txId1 = tx1.getId()
  // It would be great if we could remove this impure part
  const extendedDDOUrl = await makeExtendedDDO({
    DID: txId1,
    claimsKeyPair,
    ownerKeyPair: controlKeyPair
  })
  const newControlAddress = controlRoot.derive(1).getAddress()
  const tx2 = createSecondTransaction({
    controlBond,
    controlKeyPair,
    newControlAddress,
    extendedDDOUrl,
    feeRate,
    txId1,
    network,
    recoveryAddress,
    recoveryAmount
  })
  return ({tx1, tx2})
}

export const makeDID = async (args) => {
  const {fundingKeyPair} = args
  const fundingAddress = fundingKeyPair.getAddress()
  const utxos = await listUtxos(fundingAddress)
  let {tx1, tx2} = await makeDIDTxs({
    ...args,
    utxos
  })
  await bitcoinRpc('sendRawTransaction', tx1.toHex())
  await bitcoinRpc('sendRawTransaction', tx2.toHex())
  return {txId1: tx1.getId(), txId2: tx2.getId()}
}

import coinSelect from '/imports/bitcoin/coinSelect'
import {Meteor} from 'meteor/meteor'
import _ from 'underscore'
import makeExtendedDDO from '/imports/bitcoin/ddo'

global.Buffer = global.Buffer || require('buffer').Buffer
const bitcoin = require('bitcoinjs-lib')

const createFirstTransaction = ({
  changeAddress,
  controlAddress,
  controlBond,
  feeRate,
  fundingKeypair,
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
    throw new Meteor.Error('createDID', 'No funds in the address')
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
    txBuilder.sign(i, fundingKeypair)
  })
  const tx = txBuilder.build()
  return tx
}

const createSecondTransaction = ({
  controlBond,
  controlKeyPair,
  extendedDdoHash,
  feeRate,
  firstTxId,
  network,
  newControlAddress,
  recoveryAddress,
  recoveryAmount
}) => {
 // const oldControlKeypair = controlRoot.derive(0)
 // const controlKeyPair = controlRoot.derive(1)
 // const controlAddress = controlKeyPair.getAddress()
  const txBuilder = new bitcoin.TransactionBuilder(network)
  txBuilder.addInput(firstTxId, 0)
  console.log(txBuilder)
  // 1st: Control key
  txBuilder.addOutput(newControlAddress, controlBond - feeRate - recoveryAmount)
  // 2nd: Write DDO IPFS anchor in OP_RETURN
  const data = Buffer.from(extendedDdoHash)
  const dataScript = bitcoin.script.nullData.output.encode(data)
  txBuilder.addOutput(dataScript, 0)
  // 3rd: Recovery key
  txBuilder.addOutput(recoveryAddress, recoveryAmount)
  txBuilder.sign(0, controlKeyPair)
  const tx = txBuilder.build()
  return tx
}

const makeFirstExtendedDDO = async ({txId, claimsKeyPair, ownerKeyPair}) => {
  // const controlKeyPair = controlRoot.derive(0)
  // const claimsKeyPair = claimsRoot.derive(0)
  // const claimsPubKeys = [claimsKeyPair.getPublicKeyBuffer().toString('hex')]
  const ddo = makeExtendedDDO({txId, ownerKeyPair, claimsKeyPair})
  const ddoJSON = JSON.stringify(ddo)
  const [{hash}] = await Meteor.callPromise('ipfs.add', ddoJSON)
  return hash
}

/*
 * Creates a new DID
 *
 * @async
 * @function createDID
 * @param {number} controlBond - The amount of bitcoins in the control address
 * @param {address} fundingKeypair
 */

const createDID = async ({
  claimsRoot,
  controlBond,
  controlRoot,
  fundingKeypair,
  recoveryAddress,
  recoveryAmount,
  utxos
 // claimsAccount,
 // controlAccount,
 // walletRoot,
}) => {
  /*
  const controlRoot = walletRoot.derivePath("m/44'/0'")
    .deriveHardened(controlAccount)
    .derive(0)
  const claimsRoot = walletRoot.derivePath("m/44'/0'")
    .deriveHardened(claimsAccount)
    .derive(0)
    */
  const controlKeyPair = controlRoot.derive(0).keyPair
  const controlAddress = controlKeyPair.getAddress()
  const claimsKeyPair = claimsRoot.derive(0).keyPair
  const changeAddress = fundingKeypair.getAddress()
  const feeRate = Meteor.settings.public.feeRate
  const network = bitcoin.networks[Meteor.settings.public.network]
  const firstTx = createFirstTransaction({
    changeAddress,
    controlBond,
    controlAddress,
    feeRate,
    fundingKeypair,
    network,
    utxos
  })
  const firstTxId = firstTx.getId()
  // It would be great if we could remove this impure part
  const extendedDdoHash = await makeFirstExtendedDDO({
    txId: firstTxId,
    claimsKeyPair,
    ownerKeyPair: controlKeyPair
  })
  const newControlAddress = controlRoot.derive(1).getAddress()
  const secondTx = createSecondTransaction({
    controlBond,
    controlKeyPair,
    newControlAddress,
    extendedDdoHash,
    feeRate,
    firstTxId,
    network,
    recoveryAddress,
    recoveryAmount
  })
  return ({firstTx, secondTx})
}

export default createDID

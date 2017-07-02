import coinSelect from '/imports/bitcoin/coinSelect'
import {Meteor} from 'meteor/meteor'
import _ from 'underscore'

global.Buffer = global.Buffer || require('buffer').Buffer
const bitcoin = require('bitcoinjs-lib')

export default async ({
  controlAccount,
  ddoHash,
  walletRoot,
  fundingKeypair,
  amount,
  recoveryAddress,
  utxos
}) => {
  const controlRoot = walletRoot.derivePath("m/44'/0'")
    .deriveHardened(controlAccount)
    .derive(0)
  const changeKeypair = fundingKeypair
  const feeRate = Meteor.settings.public.feeRate
  const controlKeyPair = controlRoot.derive(0)
  const controlAddress = controlKeyPair.getAddress()
  const network = bitcoin.networks[Meteor.settings.public.network]
  /*
  let utxos
  try {
    utxos = await Meteor.callPromise('blockchaininfo.listUtxos', fundingKeypair.getAddress())
  } catch (e) {
    // error popup
    console.error(e)
    return
  }
  */
  const targets = [
    {
      address: controlAddress,
      value: amount
    },
    {
      address: recoveryAddress,
      value: amount
    }
  ]
  const {inputs, outputs} = coinSelect(utxos, targets, feeRate)
  if (!inputs || !outputs) {
    throw new Meteor.Error('createDID', 'No funds in the address')
  }
  const didTx = new bitcoin.TransactionBuilder(network)

    /*
     //output of blockchain.info
  _.each(inputs, input => {
    didTx.addInput(input.tx_hash, input.tx_output_n)
  })
  */
  // output of listUnspent
  _.each(inputs, input => {
    didTx.addInput(input.txid, input.vout)
  })

  // Write DDO IPFS anchor in OP_RETURN
  const data = Buffer.from(ddoHash)
  const dataScript = bitcoin.script.nullData.output.encode(data)
  didTx.addOutput(dataScript, 0)

  _.each(outputs, output => {
    if (!output.address) {
      output.address = changeKeypair.getAddress()
    }
    didTx.addOutput(output.address, output.value)
  })

  _.each(inputs, (input, i) => {
    didTx.sign(i, fundingKeypair)
  })
  return didTx.build()
}

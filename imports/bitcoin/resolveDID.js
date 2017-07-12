import {Meteor} from 'meteor/meteor'

global.Buffer = global.Buffer || require('buffer').Buffer
const {Transaction, script} = require('bitcoinjs-lib')

export const getDDOUri = async (did) => {
  const rawTx = await Meteor.callPromise('bitcoin', 'getRawTransaction', did)
  const tx = Transaction.fromHex(rawTx)
  const [{script: nulldata}] = tx.outs
  const ddoHash = script.nullData.output.decode(nulldata).toString()
  return ddoHash
}

export const resolveDID = async (did) => {
  const ddoHash = await getDDOUri(did)
  const ddoJSON = await Meteor.callPromise('ipfs.get', ddoHash)
  return JSON.parse(ddoJSON)
}

import {txrefDecode} from 'txref-conversion-js'
import _ from 'lodash'

import {getPath, txrefToTxid} from 'utils/txUtils'
import getDeterministicDDO from 'bitcoin/DeterministicDDO'
import {getExtendedDDO} from 'bitcoin/ExtendedDDO'

global.Buffer = global.Buffer || require('buffer').Buffer
const bitcoin = require('bitcoinjs-lib')

const isTxId = (str) => /^[0-9A-Fa-f]{64}$/.test(str)

export const getDDO = async (DID) => {
  let txId

  if (isTxId(DID)) {
    txId = DID
  } else {
    const {blockHeight, blockIndex} = txrefDecode(DID)
    txId = (await txrefToTxid(blockHeight, blockIndex))
  }

  const TxPath = await getPath(txId)
  const lastTx = _.last(TxPath)
  const tx = bitcoin.Transaction.fromHex(lastTx.tx)
  const deterministicDDO = getDeterministicDDO(tx)
  const {extendedDDOUrl} = deterministicDDO
  const extendedDDO = await getExtendedDDO(extendedDDOUrl)
  return {deterministicDDO, extendedDDO}
}

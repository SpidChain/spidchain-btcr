import {getPath} from '/imports/utils/txUtils'
import _ from 'underscore'
import getDeterministicDDO from '/imports/bitcoin/DeterministicDDO'
import {getExtendedDDO} from '/imports/bitcoin/ExtendedDDO'

global.Buffer = global.Buffer || require('buffer').Buffer
const bitcoin = require('bitcoinjs-lib')

export const getDDO = async (DID) => {
  const TxPath = await getPath(DID)
  const lastTx = _.last(TxPath)
  const tx = bitcoin.Transaction.fromHex(lastTx.tx)
  const deterministicDDO = getDeterministicDDO(tx)
  const {extendedDDOUrl} = deterministicDDO
  const extendedDDO = await getExtendedDDO(extendedDDOUrl)
  return {deterministicDDO, extendedDDO}
}

import _ from 'lodash'
import axios from 'axios'

const corsProxyUrl = process.env.corsProxyUrl

const blockcypherApi = process.env.network === 'testnet'
    ? corsProxyUrl + 'https://api.blockcypher.com/v1/btc/test3/'
    : corsProxyUrl + 'https://api.blockcypher.com/v1/btc/main/'

const soChainApi = process.env.network === 'testnet'
   ? (method) => `https://chain.so/api/v2/${method}/BTCTEST/`
   : (method) => `https://chain.so/api/v2/${method}/BTC/`

export const getSpendingTx = async (txId, ix) => {
  // block cypher
  let blockcypherRes
  try {
    const {status: blockcypherStatus, data: cyData} =
      await axios.get(blockcypherApi + `/txs/${txId}`)
    blockcypherRes = blockcypherStatus !== 200 || cyData.error
      ? 'failed' : cyData.outputs[ix].spent_by
      ? cyData.outputs[ix].spent_by
      : 'unspent'
  } catch (e) {
    blockcypherRes = {failed: true, message: e.message}
  }
  // sochain
  let sochainRes
  const sochainUrl = soChainApi('is_tx_spent') + txId + '/' + ix
  try {
    const {status: soStatus, data: soData} = await axios.get(sochainUrl)
    sochainRes = soStatus !== 200 || soData.status === 'fail'
      ? 'failed' : soData.data.is_spent
      ? soData.data.spent.txid
      : 'unspent'
    //  soData.spent.input_no
  } catch (e) {
    sochainRes = {failed: true, message: e.message}
  }
  const result = _.filter([sochainRes, blockcypherRes],
    e => !e.failed && e !== 'failed')
  const firstTxId = _.head(result)
  return firstTxId && _.every(result, e => e === firstTxId)
    ? firstTxId
    : null
}

window.getSpendingTx = getSpendingTx

export const followFirstOut = async (txId) => {
  let tip
  let thisTx = txId
  do {
    tip = thisTx
    thisTx = await getSpendingTx(thisTx, 0)
  } while (thisTx)
  return tip
}

export const getTxInfo = async (txId) => {
  let blockcypherRes
  try {
    const {
      status: blockcypherStatus,
      data: {error, block_hash, block_height, block_index, confirmed, hex}} =
      await axios.get(blockcypherApi + `/txs/${txId}`, {
        params: {
          includeHex: true
        }
      })
    blockcypherRes = blockcypherStatus !== 200 || error
      ? 'failed'
      : {
        blockHash: block_hash,
        blockTime: new Date(confirmed),
        height: block_height,
        ix: block_index,
        tx: hex
      }
  } catch (e) {
    blockcypherRes = {failed: true, message: e.message}
  }
  let sochainRes
  const sochainUrl = soChainApi('get_tx') + txId
  try {
    const {status: soStatus, data: soData} = await axios.get(sochainUrl)
    sochainRes = soStatus !== 200 || soData.status !== 'success'
      ? 'failed'
      : { tx: soData.data.tx_hex,
        blockTime: new Date(soData.data.time * 1000),
        blockHash: soData.data.blockhash }
    if (sochainRes !== 'failed') {
      const sochainUrl2 = soChainApi('get_block') + sochainRes.blockHash
      const {status: soStatus2, data: soData2} = await axios.get(sochainUrl2)
      sochainRes = soStatus2 !== 200 || soData2.status !== 'success'
        ? 'failed'
        : { ...sochainRes,
          ix: _.findIndex(soData2.data.txs, t => t === txId),
          height: soData2.data.block_no
        }
    }
  } catch (e) {
    sochainRes = {failed: true, message: e.message}
  }
  const result = _.filter([sochainRes, blockcypherRes],
    e => !e.failed && e !== 'failed')
  const firstRes = _.head(result)
  return firstRes && _.every(result, e => _.isEqual(e, firstRes))
    ? firstRes
    : null
}

window.getTxInfo = getTxInfo

export const getPath = async (txId) => {
  const path = []
  let thisTx = txId
  do {
    const txInfo = await getTxInfo(thisTx)
    path.push(txInfo)
    thisTx = await getSpendingTx(thisTx, 0)
  } while (thisTx)
  return path
}

export const txrefToTxid = async (height, index) => {
  let blockcypherRes
  try {
    const {status: blockcypherStatus, data: {error, txids}} =
      await axios.get(blockcypherApi + `/blocks/${height}?txstart=${index}&limit=1`)
    blockcypherRes = blockcypherStatus !== 200 || error
      ? 'failed'
      : txids[0]
  } catch (e) {
    blockcypherRes = {failed: true, message: e.message}
  }
  let sochainRes
  try {
    const sochainUrl = soChainApi('get_block') + height
    const {status: soStatus, data: soData} = await axios.get(sochainUrl)
    sochainRes = soStatus !== 200 || soData.status !== 'success'
      ? 'failed'
      : soData.data.txs[index]
  } catch (e) {
    sochainRes = {failed: true, message: e.message}
  }
  const result = _.filter([sochainRes, blockcypherRes],
    e => !e.failed && e !== 'failed')
  const firstRes = _.head(result)
  return firstRes && _.every(result, res => res === firstRes)
    ? firstRes
    : null
}

window.txrefToTxid = txrefToTxid

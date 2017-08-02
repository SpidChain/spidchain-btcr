import {Meteor} from 'meteor/meteor'
import axios from 'axios'

const corsProxyUrl = Meteor.settings.public.corsProxyUrl

const blockcypherApi = Meteor.settings.public.network === 'testnet'
    ? corsProxyUrl + 'https://api.blockcypher.com/v1/btc/test3/txs/'
    : corsProxyUrl + 'https://api.blockcypher.com/v1/btc/main/txs/'

export const getSpendingTx = async (txId, ix) => {
  const {data} = await axios.get(blockcypherApi + txId)
  return data.outputs[ix].spent_by || null
}

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
  const {data: {block_hash, block_height, block_index, hex}} = await
    axios.get(blockcypherApi + txId, {
      params: {
        includeHex: true
      }
    })
  const block = await Meteor.callPromise('bitcoin', 'getBlockHeader', block_hash)
  return {
    blockHash: block_hash,
    blockTime: block.time,
    height: block_height,
    ix: block_index,
    tx: hex
  }
}

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

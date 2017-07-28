import {HTTP} from 'meteor/http'

const url = (network) => network === 'testnet'
    ? 'https://api.blockcypher.com/v1/bcy/test/txs/'
    : 'https://api.blockcypher.com/v1/btc/main/txs/'

export const getSpendingTx = (txId, ix, network) => {
  const res = HTTP.get(url(network) + txId)
  const output = res.data.outputs[ix]
  const spendingTx = output.spent_by
  return spendingTx || null
}

export const followFirstOut = (txId, network) => {
  const nextTx = getSpendingTx(txId, 0, network)
  if (nextTx) {
    return followFirstOut(nextTx, network)
  }
  return txId
}

export const getTxInfo = (txId, network) => {
  const {block_height, block_index, hex} = HTTP.get(url(network) + txId, {
    params: {
      includeHex: true
    }
  }).data
  return {
    height: block_height,
    ix: block_index,
    tx: hex
  }
}

export const getPath = (txId, network) => {
  const path = []
  let nextTx = txId
  let thisTx

  while (nextTx) {
    thisTx = nextTx
    path.push(getTxInfo(thisTx, network))
    nextTx = getSpendingTx(thisTx, 0, network)
  }
  return path
}

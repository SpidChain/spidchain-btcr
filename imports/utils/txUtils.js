import axios from 'axios'

const blockcypherApi = Meteor.settings.public.network === 'testnet'
    ? 'https://api.blockcypher.com/v1/btc/test3/txs/'
    : 'https://api.blockcypher.com/v1/btc/main/txs/'

export const getSpendingTx = async (txId, ix) => {
  const {data} = await axios.get(blockcypherApi + txId)
  const {spent_by} = data.outputs[ix]
  return spent_by || null
}

export const followFirstOut = async (txId) => {
  debugger
  let tip = txId
  debugger
  let thisTx
  debugger
  while(thisTx = await getSpendingTx(tip, 0)) {
    tip = thisTx
    debugger
  }
  return tip
}

export const getTxInfo = async (txId) => {
  const {data: {block_height, block_index, hex}} = await
    axios.get(blockcypherApi + txId, {
      params: {
        includeHex: true
      }
    })
  return {
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
  } while(thisTx = await getSpendingTx(thisTx, 0))
  return path
}

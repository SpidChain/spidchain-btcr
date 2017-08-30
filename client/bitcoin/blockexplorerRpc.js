import axios from 'axios'

const blockexplorer = process.env.network === 'testnet'
  ? process.env.corsProxyUrl + 'https://testnet.blockexplorer.com/api/'
  : process.env.corsProxyUrl + 'https://blockexplorer.com/api/'

export const listUtxos = async (address) => {
  const url = `${blockexplorer}/addr/${address}/utxo`
  const result = await axios.get(url)
  if (result && result.data) {
    const data = result.data.map(({amount, txid, vout}) => ({amount, txid, vout}))
    return data
  }
  throw new Error('listUtxos')
}
window.listUtxos = listUtxos

// TODO: move these to a separate file
const blockcypher = process.env.network === 'testnet'
  ? process.env.corsProxyUrl + 'https://api.blockcypher.com/v1/btc/test3'
  : process.env.corsProxyUrl + 'https://api.blockcypher.com/v1/btc/main'

// TODO: does not work with developer key
const blocktrail = process.env.network === 'testnet'
  ? process.env.corsProxyUrl + 'https://api.blocktrail.com/v1/tBTC'
  : process.env.corsProxyUrl + 'https://api.blocktrail.com/v1/btc'

export const getBalance = async (address) => {
  const url = `${blockcypher}/addrs/${address}/balance`
  const result = await axios.get(url)
  if (result && result.data) {
    return result.data
  }
  throw new Error('getBalance')
}

export const getBalanceBT = async (address) => {
  const url = `${blocktrail}/address/${address}`
  console.log(url)
  const result = await axios.get(url)
  if (result && result.data) {
    return result.data.balance
  }
  throw new Error('getBalance')
}

export const getBalanceBE = async (address) => {
  const url = `${blockexplorer}/addr/${address}/balance`
  console.log(url)
  const result = await axios.get(url)
  if (result && result.data) {
    return result.data
  }
  throw new Error('getBalance')
}

window.getBalance = getBalance

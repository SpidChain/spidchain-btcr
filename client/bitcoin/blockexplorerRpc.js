import axios from 'axios'

// const apiUrl = '/api/blockexplorer/utxo'

const blockexplorer = process.env.network === 'testnet'
  ? 'https://testnet.blockexplorer.com'
  : 'https://blockexplorer.com'

export const listUtxos = async (address) => {
  const url = `${blockexplorer}/api/addr/${address}/utxo`
  const result = await axios.get(url)
  if (result && result.data) {
    const data = result.data.map(({amount, txid, vout}) => ({amount, txid, vout}))
    return data
  }
  throw new Error('listUtxos')
}
window.listUtxos = listUtxos

const blockcypher = process.env.network === 'testnet'
  ? 'https://api.blockcypher.com/v1/btc/test3'
  : 'https://blockexplorer.com'

export const getBalance = async (address) => {
  const url = `${blockcypher}/addrs/${address}/balance`
  const result = await axios.get(url)
  if (result && result.data) {
    return result.data
  }
  throw new Error('getBalance')
}

window.getBalance = getBalance

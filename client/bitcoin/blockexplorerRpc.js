import axios from 'axios'

const apiUrl = '/api/blockexplorer/utxo'

export const listUtxos = async (address) => {
  const {data, status} = await axios.post(apiUrl, {address})
  if (status !== 200) {
    console.error('there was an error')
    throw Error(data)
  }
  return data
}

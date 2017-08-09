import axios from 'axios'

const bitcoinRpc = async (method, ...others) => {
  const {data, status} = await axios.post('/api/bitcoin', {method, rpcArgs: others})
  if (status !== 200) {
    console.error('there was an error')
    throw Error(data)
  }
  return data
}

export default bitcoinRpc

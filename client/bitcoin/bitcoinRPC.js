import axios from 'axios'
import _ from 'lodash'

const bitcoinRpc = async () => {
  const {data, status} = await axios.post('/api/bitcoin',
    {method: arguments[0], rpcArgs: _.tail(arguments)})
  if (status !== 200) {
    console.error('there was an error')
    throw Error(data)
  }
  return data
}

export default bitcoinRpc

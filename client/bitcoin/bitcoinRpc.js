import axios from 'axios'

export const getRawTransaction = async (txId) => {
  const {data, status} = await axios.post('/api/bitcoin/getRawTransaction',
    {txId})
  if (status !== 200) {
    console.error('there was an error')
    throw Error(data)
  }
  return data
}

export const sendRawTransaction = async (tx) => {
  const {data, status} = await axios.post('/api/bitcoin/sendRawTransaction',
    {tx})
  if (status !== 200) {
    console.error('there was an error')
    throw Error(data)
  }
  return data
}

export const sendToAddress = async ({address, secret}) => {
  const {data, status} = await axios.post('/api/bitcoin/sendToAddress',
    {address, secret})
  if (status !== 200) {
    console.error('there was an error')
    throw Error(data)
  }
  return data
}

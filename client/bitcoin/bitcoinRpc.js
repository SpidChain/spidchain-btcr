import axios from 'axios'

const apiRoot = window.cordova
   ? window.device.platform === 'Android' && process.env.NODE_ENV === 'dev-compiled'
     ? process.env.ROOT_URL_ANDROID + ':' + process.env.PORT
     : process.env.ROOT_URL + ':' + process.env.PORT
   : ''

export const getRawTransaction = async (txId) => {
  const {data, status} = await axios.post(apiRoot + '/api/bitcoin/getRawTransaction',
    {txId})
  if (status !== 200) {
    console.error('there was an error')
    throw Error(data)
  }
  return data
}

export const sendRawTransaction = async (tx) => {
  const {data, status} = await axios.post(apiRoot + '/api/bitcoin/sendRawTransaction',
    {tx})
  if (status !== 200) {
    console.error('there was an error')
    throw Error(data)
  }
  return data
}

export const sendToAddress = async ({address, secret}) => {
  console.log(apiRoot + '/api/bitcoin/sendToAddress')
  const {data, status} = await axios.post(apiRoot + '/api/bitcoin/sendToAddress',
    {address, secret})
  if (status !== 200) {
    console.error('there was an error')
    throw Error(data)
  }
  return data
}

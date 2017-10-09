import axios from 'axios'

const apiRoot = window.cordova
   ? window.device.platform === 'Android' && process.env.NODE_ENV === 'dev-compiled'
     ? process.env.ROOT_URL_ANDROID + ':' + process.env.PORT
     : process.env.ROOT_URL + ':' + process.env.PORT
   : ''

const apiUrlGet = apiRoot + '/api/ipfs/get'
const apiUrlAdd = apiRoot + '/api/ipfs/add'

export const ipfsAdd = async (text) => {
  const {data, status} = await axios.post(apiUrlAdd, {text})
  if (status !== 200) {
    console.error('there was an error')
    throw Error(data)
  }
  return data
}
export const ipfsGet = async (hash) => {
  const {data, status} = await axios.post(apiUrlGet, {hash})
  if (status !== 200) {
    console.error('there was an error')
    throw Error(data)
  }
  return data
}

window.ipfsAdd = ipfsAdd
window.ipfsGet = ipfsGet

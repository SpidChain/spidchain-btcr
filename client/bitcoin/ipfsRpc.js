import axios from 'axios'

const apiUrlGet = '/api/ipfs/get'
const apiUrlAdd = '/api/ipfs/add'

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

import ipfsApi from 'ipfs-api'
import {Meteor} from 'meteor/meteor'

const streamToPromise = (stream) => {
  return new Promise((resolve, reject) => {
    let res = ''
    stream.on('data', (chunk) => {
      res += chunk.toString()
    })
    stream.on('error', (err) => {
      reject(err)
    })
    stream.on('end', () => {
      resolve(res)
    })
  })
}

const host = Meteor.settings.public.ipfsHost

Meteor.methods({
  'ipfs.add': async (text) => {
    if (Meteor.isServer) {
      const ipfs = ipfsApi(host, '5001', {protocol: 'http'})
      const buffer = Buffer.from(text)
      const hash = await ipfs.files.add(buffer)
      return hash
    }
  },

  'ipfs.get': async (hash) => {
    if (Meteor.isServer) {
      const ipfs = ipfsApi(host, '5001', {protocol: 'http'})
      const stream = await ipfs.cat(hash)
      return streamToPromise(stream)
    }
  }
})

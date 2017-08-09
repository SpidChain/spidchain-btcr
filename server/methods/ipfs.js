const ipfsApi = require('ipfs-api')
const bodyParser = require('body-parser')

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

const host = process.env.ipfsHost

const ipfsRpcRoute = (app) => {
  app.use('/api/ipfs/add', bodyParser.json(), async (req, res) => {
    const {body:{text}} = req
    try {
      const ipfs = ipfsApi(host, '5001', {protocol: 'http'})
      const buffer = Buffer.from(text)
      const hash = await ipfs.files.add(buffer)
      return res.status(200).json(hash)
    } catch (e) {
      return res.status(500).json(e)
    }
  })

  app.use('/api/ipfs/get', bodyParser.json(), async (req, res) => {
    const {body: {hash}} = req
    try {
      const ipfs = ipfsApi(host, '5001', {protocol: 'http'})
      const stream = await ipfs.cat(hash)
    debugger
      const result = await streamToPromise(stream)
    debugger
      return res.status(200).json(result)
    } catch (e) {
      return res.status(500).json(e)
    }
  })
}

module.exports = ipfsRpcRoute

/*
const ipfsTypeDefs = `
extend type Mutation {
  ipfsAdd (text: String) : String
  ipfsGet(hash: String) : String
}
`
const host = process.env.ipfsHost

const ipfsResolver = {
  Mutation: {
    ipfsAdd: async (root, {text}) => {
      const ipfs = ipfsApi(host, '5001', {protocol: 'http'})
      const buffer = Buffer.from(text)
      const hash = await ipfs.files.add(buffer)
      return hash
    },
    ipfsGet: async (hash) => {
      const ipfs = ipfsApi(host, '5001', {protocol: 'http'})
      const stream = await ipfs.cat(hash)
      return streamToPromise(stream)
    }
  }
}

module.exports = {
  ipfsTypeDefs,
  ipfsResolver
}
*/

/*
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
*/

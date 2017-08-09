const bodyParser = require('body-parser')
const axios = require('axios')

const blockexplorer = process.env.network === 'testnet'
  ? 'https://testnet.blockexplorer.com'
  : 'https://blockexplorer.com'

const blockexplorerRoute = async (app) => {
  app.use('/api/blockexplorer/utxo', bodyParser.json(), async ({body: {address}}, res) => {
    const url = `${blockexplorer}/api/addr/${address}/utxo`
    try {
      const result = await axios.get(url)
      if (result && result.data) {
        const data = result.data.map(({amount, txid, vout}) => ({amount, txid, vout}))
        return res.status(200).json(data)
      }
      return res.status(500).json(Error('blockexplorer.utxo', 'No data in the result'))
    } catch (err) {
      return res.status(500).json(Error('blockexplorer.utxo', err))
    }
  })
}

module.exports = blockexplorerRoute

/*
const blockexplorerTypeDefs = `
type UTXO {
amount: Number
txid: String
vout: Number
}
extend type Mutation {
  utxo(addr: String): [UTXO]
}
`
const blockexplorerResolver = {
  Mutation: {
    utxo: async (root, {addr}) => {
      const url = `${blockexplorer}/api/addr/${addr}/utxo`
      try {
        const res = await axios.get(url)
        if (res && res.data) {
          return res.data.map(({amount, txid, vout}) => ({amount, txid, vout}))
        }
        throw new Error('blockexplorer.utxo', 'No data in the result')
      } catch (err) {
        throw new Error('blockexplorer.utxo', err)
      }
    }
  }
}

module.exports = {
  blockexplorerTypeDefs,
  blockexplorerResolver
}
*/
/*
Meteor.methods({
  'blockexplorer.utxo': (addr) => {
    if (Meteor.isServer) {
      const url = `${blockexplorer}/api/addr/${addr}/utxo`
      try {
        const res = HTTP.get(url)
        if (res && res.data) {
          return res.data.map(({amount, txid, vout}) => ({amount, txid, vout}))
        }
        throw new Meteor.Error('blockexplorer.utxo', 'No data in the result')
      } catch (err) {
        throw new Meteor.Error('blockexplorer.utxo', err)
      }
    }
  }
})
*/

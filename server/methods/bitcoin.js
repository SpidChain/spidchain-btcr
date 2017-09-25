const Client = require('bitcoin-core')
const bodyParser = require('body-parser')

const client = new Client({
  host: process.env.bitcoinHost,
  password: 'bar',
  network: process.env.network,
  username: 'foo'
})

const getRawTransaction = (app) => {
  app.use('/api/bitcoin/getRawTransaction', bodyParser.json(), async (req, res) => {
    const {body: {txId}} = req
    try {
      // return the transaction, verbose mode
      const result = await client['getRawTransaction'](txId, true)
      return res.status(200).json(result)
    } catch (e) {
      // TODO: Better error logging
      console.error(e)
      return res.status(500).json(e)
    }
  })
}

const sendRawTransaction = (app) => {
  app.use('/api/bitcoin/sendRawTransaction', bodyParser.json(), async (req, res) => {
    const {body: {tx}} = req
    try {
      const result = await client['sendRawTransaction'](tx)
      return res.status(200).json(result)
    } catch (e) {
      // TODO: Better error logging
      console.error(e)
      return res.status(500).json(e)
    }
  })
}

const sendToAddress = (app) => {
  const amount = process.env.sendAmount
  const sendSecret = process.env.sendSecret
  app.use('/api/bitcoin/sendToAddress', bodyParser.json(), async (req, res) => {
    const {body: {address, secret}} = req
    if (sendSecret !== secret) {
      console.error('Invalid code')
      return res.status(500).json(new Error('Invalid Code'))
    }
    try {
      const result = await client['sendToAddress'](address, amount)
      return res.status(200).json(result)
    } catch (e) {
      // TODO: Better error logging
      console.error(e)
      return res.status(500).json(e)
    }
  })
}

module.exports = {getRawTransaction, sendRawTransaction, sendToAddress}

const Client = require('bitcoin-core')
const bodyParser = require('body-parser')

const client = new Client({
  host: process.env.bitcoinHost,
  password: 'bar',
  network: process.env.network,
  username: 'foo'
})

const bitcoinRpcRoute = (app) => {
  app.use('/api/bitcoin', bodyParser.json(), (req, res) => {
    const body = req.body
    try {
      const result = client[body.method].apply(null, body.rpcArgs)
      const value = JSON.stringify(result)
      return res.status(200).send(value)
    } catch (e) {
      return res.status(500).send(JSON.stringify(e))
    }
  })
}

module.exports = bitcoinRpcRoute

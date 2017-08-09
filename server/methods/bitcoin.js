const Client = require('bitcoin-core')
const bodyParser = require('body-parser')

const client = new Client({
  host: process.env.bitcoinHost,
  password: 'bar',
  network: process.env.network,
  username: 'foo'
})

const bitcoinRpcRoute = (app) => {
  app.use('/api/bitcoin', bodyParser.json(), async (req, res) => {
    const {body: {method, rpcArgs}} = req
    try {
      const result = await client[method](...rpcArgs)
      const value = JSON.stringify(result)
      return res.status(200).send(value)
    } catch (e) {
      return res.status(500).send(JSON.stringify(e))
    }
  })
}

module.exports = bitcoinRpcRoute

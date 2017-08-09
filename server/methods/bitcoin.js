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
      return res.status(200).json(result)
    } catch (e) {
      return res.status(500).json(e)
    }
  })
}

module.exports = bitcoinRpcRoute

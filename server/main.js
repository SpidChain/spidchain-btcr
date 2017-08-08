/*
import '/imports/methods/bitcoin'
import '/imports/methods/blockchaininfo'
import '/imports/methods/blockexplorer'
import '/imports/methods/ipfs'
import '/imports/methods/Messaging'
*/
require('dotenv').config()
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const config = require('../webpack.config.js')
const {graphqlExpress, graphiqlExpress} = require('graphql-server-express')
const DIST_DIR = path.join(__dirname, '../dist')
const nodeEnv = process.env.NODE_ENV || 'development'
const isProduction = nodeEnv === 'production'
const port = isProduction ? process.env.PORT : process.env.TEST_PORT
const compiler = webpack(config)

const makeDefaultSchema = require('./collections')
const bitcoinRpcRoute = require('./methods/bitcoin')
const ipfsRpcRoute = require('./methods/ipfs')
const blockexplorerRoute = require('./methods/blockexplorer')

const app = express()

if (!isProduction) {
  app.use(webpackDevMiddleware(compiler, {
    quiet: true,
    publicPath: config.output.publicPath
  }))
  app.use(webpackHotMiddleware(compiler))
} else {
  app.get('/', function (req, res) {
    res.sendFile(path.join(DIST_DIR + '/index.html'))
  })

  app.get('/index.js', function (req, res) {
    res.sendFile(path.join(DIST_DIR + '/index.js'))
  })
};
 
(async () => {
  const schema = await makeDefaultSchema()
  app.use('/graphql', bodyParser.json(), graphqlExpress({schema}))
  app.use('/graphiql', graphiqlExpress({endpointURL: '/graphql'}))
  app.use(express.static('public'))
  await bitcoinRpcRoute(app)
  await ipfsRpcRoute(app)
  await blockexplorerRoute(app)
  app.listen(port)
})()

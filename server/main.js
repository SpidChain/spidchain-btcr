const path = require('path')
const isProduction = process.env.NODE_ENV === 'production'
const isDevHot = process.env.NODE_ENV === 'dev-hot'
const isDevCompiled = process.env.NODE_ENV === 'dev-compiled'
/*
require('dotenv').config({path: isProduction
  ? path.join(__dirname, '../.env')
  : path.join(__dirname, '../.env-dev')})
  */
const dotenv = require('dotenv')
if (isProduction) {
  dotenv.config({path: path.join(__dirname, '../.env')})
}
if (isDevHot || isDevCompiled) {
  dotenv.config({path: path.join(__dirname, '../.env-dev')})
}

const PORT = process.env.PORT
if (!PORT) throw Error('PORT is undefined')
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const history = require('connect-history-api-fallback')
const webpack = isDevHot ? require('webpack') : undefined
const webpackDevMiddleware = isDevHot ? require('webpack-dev-middleware') : undefined
const webpackHotMiddleware = isDevHot ? require('webpack-hot-middleware') : undefined
const config = isDevHot ? require('../webpack.config.js') : undefined
const {graphqlExpress, graphiqlExpress} = require('graphql-server-express')
const DIST_DIR = path.join(__dirname, '../dist')
const makeDefaultSchema = require('./collections')
const {
  getRawTransaction,
  sendRawTransaction,
  sendToAddress
} = require('./methods/bitcoin')
const ipfsRpcRoute = require('./methods/ipfs')

const app = express()

app.use(history({rewrites: [
  {
    from: /^\/graph/,
    to: function (context) {
      return context.parsedUrl.pathname
    }
  },
  {
    from: /^\/api/,
    to: function (context) {
      return context.parsedUrl.pathname
    }
  }
]}
))

if (isProduction || isDevCompiled) {
  app.use('/icons', express.static(path.join(__dirname, '../dist/icons')))
  app.use('/fonts', express.static(path.join(__dirname, '../dist/fonts')))
  app.get('/index.js', (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.js'))
  })
  app.get('/index.js.map', (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.js.map'))
  })
  app.get('/styles.css', (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'styles.css'))
  })
  app.get('/styles.css.map', (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'styles.css.map'))
  })
  app.get('/index.html', (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'))
  })
} else {
  const compiler = webpack(config)
  app.use(webpackDevMiddleware(compiler, {
    quiet: true,
    publicPath: config.output.publicPath
  }))
  app.use(webpackHotMiddleware(compiler))
}

// Don't remove the semicolon!

if (isDevHot || isDevCompiled) {
  app.use(morgan('tiny'))
}

app.use(express.static('public'));
(async () => {
  const schema = await makeDefaultSchema()
  app.use('/graphql', bodyParser.json(), graphqlExpress({schema}))
  app.use('/graphiql', graphiqlExpress({endpointURL: '/graphql'}))
  // /api/ routes
  await sendToAddress(app)
  await sendRawTransaction(app)
  await getRawTransaction(app)
  await ipfsRpcRoute(app)
  app.listen(PORT)
})()

const Dotenv = require('dotenv-webpack')
const {getIfUtils, removeEmpty} = require('webpack-config-utils')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const StyleExtHtmlWebpackPlugin = require('style-ext-html-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const path = require('path')
const webpack = require('webpack')

const NODE_ENV = process.env.NODE_ENV || 'development'
const {ifProduction, ifNotProduction} = getIfUtils(NODE_ENV)
module.exports = {
  entry: removeEmpty([
    ifNotProduction('webpack-hot-middleware/client?reload=true'),
    path.join(__dirname, 'client/main.jsx')
  ]),
  devtool: ifProduction('source-map', 'eval-source-map'),
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: 'index.js'
  },
  plugins: removeEmpty([
    new ProgressBarPlugin(),
    new Dotenv({path: NODE_ENV !== 'development'
      ? path.join(__dirname, '.env')
      : path.join(__dirname, '.env-dev')}),
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new HtmlWebpackPlugin({
      inject: 'head',
      template: path.join(__dirname, 'client/index.html')
    }),
    new ExtractTextPlugin('styles.css'),
    ifNotProduction(new webpack.HotModuleReplacementPlugin()),
    new StyleExtHtmlWebpackPlugin({
      minify: true
    }),
    ifProduction(new webpack.LoaderOptionsPlugin({
      minimize: true,
      quiet: true
    })),
    ifProduction(new UglifyJsPlugin())
  ]),
  resolve: {
    modules: [path.resolve(__dirname, 'client'), 'node_modules'],
    extensions: ['.js', '.jsx', '.scss']
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.css$/,
        use: ifProduction(['style-loader', 'css-loader'], ['css-loader'])
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader']
        })
      },
      {
        test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        use: 'file-loader?name=fonts/[name].[ext]'
      }
    ]
  }
}

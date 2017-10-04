const Dotenv = require('dotenv-webpack')
const {removeEmpty} = require('webpack-config-utils')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const StyleExtHtmlWebpackPlugin = require('style-ext-html-webpack-plugin')
const MinifyPlugin = require('babel-minify-webpack-plugin')
const path = require('path')
const webpack = require('webpack')
const isProduction = process.env.NODE_ENV === 'production'
const isDevHot = process.env.NODE_ENV === 'dev-hot'
const isDevCompiled = process.env.NODE_ENV === 'dev-compiled'

module.exports = {
  entry: removeEmpty([
    'babel-polyfill',
    isDevHot ? 'webpack-hot-middleware/client?reload=true' : undefined,
    path.join(__dirname, 'client', 'main.jsx')
  ]),
  devtool: isProduction ? 'source-map' : 'eval-source-map',
  output: {
    path: path.join(__dirname, 'dist'),
    // publicPath: './',
    filename: 'index.js'
  },
  plugins: removeEmpty([
    new ProgressBarPlugin(),
    new Dotenv({
      path: isProduction
       ? path.join(__dirname, '.env')
       : path.join(__dirname, '.env-dev')
    }),
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new FaviconsWebpackPlugin({
      logo: path.join(__dirname, 'client', 'assets', 'spidchain-icon'),
      prefix: 'icons/'
    }),
    new HtmlWebpackPlugin({
      inject: 'body',
      title: 'Spidchain',
      template: path.join(__dirname, 'client', 'index.html')
    }),
    new HtmlWebpackPlugin({
      inject: 'body',
      title: 'Spidchain',
      filename: 'index-cordova.html',
      template: path.join(__dirname, 'client', 'index-cordova.html')
    }),
    new ExtractTextPlugin({
      filename: 'styles.css',
      disable: false // isDevHot || isDevCompiled
    }),
    isDevHot ? new webpack.HotModuleReplacementPlugin() : undefined,
    isProduction ? new StyleExtHtmlWebpackPlugin({
      minify: true
    })
    : undefined,
    isProduction ? new webpack.LoaderOptionsPlugin({
      minimize: true,
      quiet: true
    })
    : undefined
    // ifProduction(new MinifyPlugin({mangle: false}))
  ]),
  resolve: {
    modules: [path.resolve(__dirname, 'client'), 'node_modules'],
    extensions: ['.js', '.jsx', '.scss', '.svg']
  },
  module: {
    rules: [
      {
        test: /\.txt/,
        exclude: /node_modules/,
        use: ['raw-loader']
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          use: [
            {loader: 'css-loader', options: {sourceMap: true}}
          ],
          fallback: 'style-loader'
        })
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          use: [
            {loader: 'css-loader', options: {sourceMap: true}},
            {loader: 'sass-loader', options: {sourceMap: true}}
          ],
          fallback: 'style-loader'
        })
      },
      {
        test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        exclude: /client/,
        use: 'file-loader?name=fonts/[name].[ext]'
      },
      {
        test: /\.svg$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'react-svg-loader'
          }
        ]
      }
    ]
  }
}

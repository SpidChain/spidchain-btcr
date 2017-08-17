const Dotenv = require('dotenv-webpack')
const {getIfUtils, removeEmpty} = require('webpack-config-utils')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const StyleExtHtmlWebpackPlugin = require('style-ext-html-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const path = require('path')
const webpack = require('webpack')

const {ifProduction, ifNotProduction} = getIfUtils(process.env.NODE_ENV)

module.exports = {
  entry: removeEmpty([
    ifNotProduction('webpack-hot-middleware/client?reload=true'),
    path.join(__dirname, 'client', 'main.jsx')
  ]),
  devtool: ifProduction('source-map', 'eval-source-map'),
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: 'index.js'
  },
  plugins: removeEmpty([
    new ProgressBarPlugin(),
    new Dotenv({
      path: ifProduction(
        path.join(__dirname, '.env'),
        path.join(__dirname, '.env-dev')
      )
    }),
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new HtmlWebpackPlugin({
      inject: 'head',
      template: path.join(__dirname, 'client', 'index.html')
    }),
    new ExtractTextPlugin({
      filename: 'styles.css',
      disable: ifNotProduction(true, false)
    }),
    ifNotProduction(new webpack.HotModuleReplacementPlugin()),
    ifProduction(new StyleExtHtmlWebpackPlugin({
      minify: true
    })),
    ifProduction(new webpack.LoaderOptionsPlugin({
      minimize: true,
      quiet: true
    }))
    // ifProduction(new UglifyJsPlugin())
  ]),
  resolve: {
    modules: [path.resolve(__dirname, 'client'), 'node_modules'],
    extensions: ['.js', '.jsx', '.scss']
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
        use: 'file-loader?name=fonts/[name].[ext]'
      }
    ]
  }
}

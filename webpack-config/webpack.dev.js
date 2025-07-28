const { merge } = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const common = require('./webpack.common.js')
const path = require('path')
const { DefinePlugin } = require('webpack')

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    static: {
      directory: path.join(__dirname, '../dist'),
    },
    hot: true,
  },
  devtool: 'inline-source-map',
  experiments: { asyncWebAssembly: true },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './index.dev.html'),
    }),
    new DefinePlugin({
      ENV_SERVER_ADDRESS: JSON.stringify('http://localhost:9090'),
    }),
  ],
})

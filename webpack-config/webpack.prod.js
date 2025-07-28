const { merge } = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const common = require('./webpack.common.js')
const path = require('path')
const { DefinePlugin } = require('webpack')

module.exports = merge(common, {
  mode: 'production',
  performance: {
    hints: false,
  },
  experiments: {
    outputModule: true,
  },
  externals: {
    three: 'module three',
    '@dimforge/rapier3d': 'module @dimforge/rapier3d',
  },
  module: {
    rules: [
      {
        test: /dimforge\/rapier3d/,
        sideEffects: true,
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './index.prod.html'), // this template should include a cdn link to a three import
      scriptLoading: 'module',
    }),
    new DefinePlugin({
      ENV_SERVER_ADDRESS: JSON.stringify(
        'http://ec2-44-248-33-241.us-west-2.compute.amazonaws.com:9090'
      ),
    }),
  ],
})

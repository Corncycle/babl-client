const { merge } = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const common = require('./webpack.common.js')
const path = require('path')

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    static: {
      directory: path.join(__dirname, '../dist'),
    },
    hot: true,
  },
  // externals: {
  //   'explorer-debugger': './debug/DevDebugger.ts',
  // },
  devtool: 'inline-source-map',
  experiments: { asyncWebAssembly: true },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './index.dev.html'),
    }),
  ],
})

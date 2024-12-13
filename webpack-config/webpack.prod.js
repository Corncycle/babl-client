const { merge } = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const common = require('./webpack.common.js')
const path = require('path')

module.exports = merge(common, {
  mode: 'production',
  performance: {
    hints: false,
  },
  experiments: {
    outputModule: true,
  },
  // externals: {
  //   three: 'module three',
  //   'explorer-debugger': './debug/ProdDebugger.ts',
  // },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './index.prod.html'), // this template should include a cdn link to a three import
      scriptLoading: 'module',
    }),
  ],
})

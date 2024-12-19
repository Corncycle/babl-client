const path = require('path')

module.exports = {
  entry: path.resolve(__dirname, '../src/client.ts'),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.txt/,
        type: 'asset/source',
      },
      {
        test: /\.(vert|frag)/,
        type: 'asset/source',
      },
    ],
  },
  resolve: {
    extensionAlias: {
      '.js': ['.js', '.ts'],
    },
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../dist'),
  },
}

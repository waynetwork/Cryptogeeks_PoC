const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: ['babel-polyfill', './src/javascript/index'],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'temp')
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new CopyWebpackPlugin([{ from: 'src/static/' }]),
    new ExtractTextPlugin('style.css')
  ],
  module: {
    rules: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.less$/,
        loader: ExtractTextPlugin.extract({
          use: ['css-loader', 'less-loader']
        })
      }
    ]
  }
};
